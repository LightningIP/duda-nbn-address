<template>
  <v-sheet>

    <AddressBar v-model="addressSearchString" :loading="loading" :disabled="loading || searchDisabled"/>

    <v-dialog max-width="500" v-model="resultsDialog">
      <template v-slot:default="{ isActive }">
        <v-card title="Select your address">
          <v-card-text>
            <h3 class="pb-2">
                We found a couple of addresses that match your search,
                please select the correct address below...
            </h3>
            <v-radio-group v-model="resultsDialogLOCID">
                <v-data-iterator :items="addressResults" :page="locidResultsPage">
                    <template v-slot:default="{ items }">
                        <template v-for="(item) in items" :key="item.value"  >
                            <v-radio v-bind="item.raw"></v-radio>
                        </template>
                    </template>
                    <template v-slot:footer v-if="addressResults.length > 5">
                        <v-pagination
                            v-model="locidResultsPage"
                            :length="Math.ceil(addressResults.length / 5)"
                        ></v-pagination>
                    </template>
                </v-data-iterator>
            </v-radio-group>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text="Close Dialog"
              @click="isActive.value = false; closeResultsDialog()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>


    <div>{{ addressSearchString }}</div>
    <pre>{{ serviceQualification }}</pre>
    <div>Results: {{ addressResults }}</div>
  </v-sheet>
</template>

<script setup lang="ts">
  import AddressBar from './components/AddressBar.vue';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    redirect: {
      fixedline: string,
      wireless: string,
      satellite: string,
    }
  }>();

  const addressSearchString = ref<string>('');
  const loading = ref<boolean>(false);
  const searchDisabled = ref<boolean>(false);
  const addressResults = ref<{ label: string, value: string }[]>([]);
  const resultsDialog = ref<boolean>(false);
  const resultsDialogLOCID = ref<string>('');
  const locidResultsPage = ref<number>(1);
  const serviceQualification = ref<any>(null);

  const quickSq = ref<null | {
    id: string,
    formattedAddress: string,
    newDev: boolean,
    technology: string,
    serviceClass: string,
    fibreUpgrade: boolean,
    eeZone: string,
    eeBuild: 'A' | 'B' | 'C';
  }>(null);

  const handleLocation = async (data: any) => {
    serviceQualification.value = data;
    quickSq.value = {
      id: data.id,
      formattedAddress: data.address.formattedAddress,
      technology: data.primaryTechnology.supportingTechnology.primaryAccessTechnology,
      serviceClass: data.primaryTechnology.supportingTechnology.serviceabilityClass,
      newDev: data.primaryTechnology.supportingRelatedLocationFeatures.newDevelopmentsChargeApplies,
      fibreUpgrade: data.primaryTechnology.supportingTechnology.alternativeTechnology == 'Fibre',
      eeZone: data.enterpriseEthernet.supportingRelatedSiteBoundaries.zone,
      eeBuild: data.enterpriseEthernet.supportingRelatedLocationFeatures.fibreBuildCategory,
    }

    if (quickSq.value.technology == 'Fibre') {
      window.location.href = props.redirect.fixedline + '?locid=' + data.id;
      return;
    }

    console.log(props.redirect);
    console.log(quickSq.value);

    alert('Sorry... we don\'t have a redirect for this technology yet.');

  }

  const fetchLocation = async (locid: string) => {
    const resp = await fetch('https://api.lip.net.au/nbn-sq/location/' + locid);
    const json = await resp.json();
    await handleLocation(json.data);
  }

  const fetchAddressSearch = async (search: string) => {
    const resp = await fetch('https://api.lip.net.au/nbn-sq/search?address=' + search);
    const { data } = await resp.json();

    // Handle one address returned
    if(data.length == 1) {
      await fetchLocation(data[0].id);
    }

    if(data.length > 1) {
      addressResults.value = data.map((item: any) => ({
        label: item.formattedAddress,
        value: item.id,
      }));

      resultsDialog.value = true;
    }
  }

  const closeResultsDialog = async () => {
    resultsDialog.value = false;

    if (!resultsDialogLOCID.value) {
      searchDisabled.value = false;
      addressSearchString.value = '';
      addressResults.value = [];
      return;
    }

    const addressItem = addressResults.value.find((item) => item.value === resultsDialogLOCID.value);

    if (!addressItem) return;

    addressSearchString.value = addressItem.label;
    loading.value = true;
    searchDisabled.value = true;
    await fetchLocation(addressItem.value);
    loading.value = false;
    searchDisabled.value = false;
  }

  watch(addressSearchString, async (searchString) => {

    // Reset values if search string is empty
    if (!searchString) {
      serviceQualification.value = null;
      addressResults.value = [];
      return;
    }

    loading.value = true;

    if (searchString.match(/^LOC\d{12}$/)) {
      try {
        await fetchLocation(searchString);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    }

    else {
      try {
        await fetchAddressSearch(searchString);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    }

  });

  watch(resultsDialogLOCID, async (locid) => {
    if (!locid) return;
  });

</script>
