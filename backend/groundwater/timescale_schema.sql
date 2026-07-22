--
-- PostgreSQL database dump
--
-- TimescaleDB hypertables for pumping, rainfall, groundwater_levels, water_quality, weather.
-- These tables live outside Django's migration system because TimescaleDB hypertables
-- aren't compatible with Django's default primary-key/ORM assumptions.
--
-- Usage on a fresh environment:
--   1. Run `python manage.py migrate` first (creates wells, users, gis_layers, etc.)
--   2. Then run: psql $DATABASE_URL -f groundwater/timescale_schema.sql
\restrict PjpUuhC2UTAjm7GWoXRnZmOwDQsgCkd1MSD0xN7sfbpRSImZID9XrFFZ2G2FI2X

-- Dumped from database version 17.10 (Homebrew)
-- Dumped by pg_dump version 17.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE EXTENSION IF NOT EXISTS timescaledb;
--
-- Name: rainfall; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rainfall (
    "time" timestamp with time zone NOT NULL,
    station_name character varying(100) NOT NULL,
    rainfall_mm double precision NOT NULL
);


--
-- Name: groundwater_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groundwater_levels (
    "time" timestamp with time zone NOT NULL,
    well_id integer NOT NULL,
    water_level_m double precision NOT NULL
);


--
-- Name: weather; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weather (
    "time" timestamp with time zone NOT NULL,
    station_name character varying(100),
    temperature_c double precision,
    humidity_pct double precision
);


--
-- Name: pumping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pumping (
    "time" timestamp with time zone NOT NULL,
    well_id integer,
    pumping_hours double precision
);


--
-- Name: water_quality; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.water_quality (
    "time" timestamp with time zone NOT NULL,
    well_id integer NOT NULL,
    tds_ppm double precision,
    salinity_ppt double precision
);


--
-- Name: groundwater_levels_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groundwater_levels_time_idx ON public.groundwater_levels USING btree ("time" DESC);


--
-- Name: pumping_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pumping_time_idx ON public.pumping USING btree ("time" DESC);


--
-- Name: rainfall_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rainfall_time_idx ON public.rainfall USING btree ("time" DESC);


--
-- Name: water_quality_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX water_quality_time_idx ON public.water_quality USING btree ("time" DESC);


--
-- Name: weather_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weather_time_idx ON public.weather USING btree ("time" DESC);


--
-- Name: groundwater_levels groundwater_levels_well_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groundwater_levels
    ADD CONSTRAINT groundwater_levels_well_id_fkey FOREIGN KEY (well_id) REFERENCES public.wells(id) ON DELETE CASCADE;


--
-- Name: pumping pumping_well_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pumping
    ADD CONSTRAINT pumping_well_id_fkey FOREIGN KEY (well_id) REFERENCES public.wells(id) ON DELETE CASCADE;


--
-- Name: water_quality water_quality_well_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_quality
    ADD CONSTRAINT water_quality_well_id_fkey FOREIGN KEY (well_id) REFERENCES public.wells(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PjpUuhC2UTAjm7GWoXRnZmOwDQsgCkd1MSD0xN7sfbpRSImZID9XrFFZ2G2FI2X


-- Convert these tables into TimescaleDB hypertables
SELECT create_hypertable('pumping', 'time', if_not_exists => TRUE, migrate_data => TRUE);
SELECT create_hypertable('rainfall', 'time', if_not_exists => TRUE, migrate_data => TRUE);
SELECT create_hypertable('groundwater_levels', 'time', if_not_exists => TRUE, migrate_data => TRUE);
SELECT create_hypertable('water_quality', 'time', if_not_exists => TRUE, migrate_data => TRUE);
SELECT create_hypertable('weather', 'time', if_not_exists => TRUE, migrate_data => TRUE);
