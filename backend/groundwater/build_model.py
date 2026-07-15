import os
import flopy
from django.db import connection
from .simulation_config import SIMULATION_CONFIG
def get_initial_head():
    """
    Get the average groundwater level from the database.
    """

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT AVG(water_level_m)
            FROM groundwater_map
            WHERE water_level_m IS NOT NULL;
        """)

        head = cursor.fetchone()[0]

    return float(head or 10.0)
def get_average_recharge():
    """
    Calculates recharge from the rainfall table.
    Returns recharge in m/day.
    """

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT AVG(rainfall_mm)
            FROM rainfall;
        """)

        avg_rainfall = cursor.fetchone()[0] or 0

    # Convert mm to meters
    rainfall_m = avg_rainfall / 1000.0

    # Assume 12% becomes groundwater recharge
    recharge = rainfall_m * 0.12

    return recharge
def create_modflow_model():

    workspace = os.path.join(os.getcwd(), "modflow_workspace")
    os.makedirs(workspace, exist_ok=True)

    sim = flopy.mf6.MFSimulation(
        sim_name="groundwater_model",
        sim_ws=workspace,
        exe_name="/Users/shreyasisoumya/Downloads/mf6.7.0_mac/bin/mf6",
    )

    flopy.mf6.ModflowTdis(
        sim,
        time_units="DAYS",
        perioddata=[(SIMULATION_CONFIG["simulation_days"], 1, 1.0)],
    )

    flopy.mf6.ModflowIms(sim)

    gwf = flopy.mf6.ModflowGwf(
        sim,
        modelname="groundwater",
        save_flows=True,
    )

    flopy.mf6.ModflowGwfdis(
        gwf,
        nlay=SIMULATION_CONFIG["nlay"],
        nrow=20,
        ncol=20,
        delr=SIMULATION_CONFIG["cell_size"],
        delc=SIMULATION_CONFIG["cell_size"],
        top=SIMULATION_CONFIG["top"],
        botm=[SIMULATION_CONFIG["bottom"]],
    )

    initial_head = get_initial_head()

    flopy.mf6.ModflowGwfic(
        gwf,
        strt=initial_head,
    )

    flopy.mf6.ModflowGwfnpf(
        gwf,
        icelltype=1,
        k=SIMULATION_CONFIG["hydraulic_conductivity"],
    )

    flopy.mf6.ModflowGwfsto(
        gwf,
        iconvert=1,
        sy=SIMULATION_CONFIG["specific_yield"],
        ss=SIMULATION_CONFIG["specific_storage"],
        transient=True,
    )
    recharge = get_average_recharge()

    flopy.mf6.ModflowGwfrcha(
        gwf,
        recharge=recharge,
    )

    flopy.mf6.ModflowGwfoc(
        gwf,
        head_filerecord="groundwater.hds",
        budget_filerecord="groundwater.cbc",
        saverecord=[("HEAD", "ALL"), ("BUDGET", "ALL")],
    )

    sim.write_simulation()

    success, output = sim.run_simulation()
    headobj = gwf.output.head()
    head = headobj.get_data(kstpkper=(0, 0))

    return {
    "success": success,
    "workspace": workspace,
    "recharge": recharge,
    "min_head": float(head.min()),
    "max_head": float(head.max()),
    "mean_head": float(head.mean()),
    "initial_head": initial_head,
}