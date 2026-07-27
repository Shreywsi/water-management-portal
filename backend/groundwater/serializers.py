from rest_framework import serializers


from .models import WaterBalance


class WaterBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterBalance
        fields = "__all__"

from .models import Well, WellParameter


class WellParameterSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = WellParameter
        fields = [
            "id",
            "parameter_name",
            "parameter_value",
        ]


class WellSerializer(serializers.ModelSerializer):
    parameters = WellParameterSerializer(many=True)

    class Meta:
        model = Well
        fields = [
            "id",
            "location",
            "well_id",
            "observation_date",
            "latitude",
            "longitude",
            "parameters",
        ]

    def create(self, validated_data):
        parameters = validated_data.pop("parameters")

        well = Well.objects.create(**validated_data)

        for parameter in parameters:
            WellParameter.objects.create(
                well=well,
                **parameter
            )

        return well

    def update(self, instance, validated_data):
        parameters = validated_data.pop("parameters", [])

        instance.location = validated_data.get("location", instance.location)
        instance.well_id = validated_data.get("well_id", instance.well_id)
        instance.observation_date = validated_data.get(
            "observation_date",
            instance.observation_date,
        )
        instance.latitude = validated_data.get("latitude", instance.latitude)
        instance.longitude = validated_data.get("longitude", instance.longitude)

        instance.save()

        # Remove old parameters
        instance.parameters.all().delete()

        # Add updated parameters
        for parameter in parameters:
            WellParameter.objects.create(
                well=instance,
                **parameter,
            )

        return instance