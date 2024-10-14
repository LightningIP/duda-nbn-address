<template>
  <v-app :full-height="false">
    <v-main>

      <v-card density="compact">

        <!-- Address Bar -->
        <AddressBar v-model="addressSearchString" :disabled="loading || searchDisabled"
          v-if="!quickSq && !addressResults.length"
        />

        <!-- Choose Banner -->
        <v-banner
          v-if="addressResults.length > 1 && !quickSq"
          color="info"
          lines="one"
        >
          <v-banner-text>
            <h4>{{ addressResults.length }} addresses found.</h4>
          </v-banner-text>

          <template v-slot:actions>
            <v-btn @click="resetForm()" variant="plain" color="danger" v-if="!loading && !searchDisabled"><v-icon>mdi-close-circle-outline</v-icon></v-btn>
            <v-btn @click="resultsDialog = !resultsDialog" variant="tonal" :loading="loading">Choose</v-btn>
          </template>
        </v-banner>

        <v-card v-if="quickSq" flat>
          <v-card-title>{{ quickSq.formattedAddress }}</v-card-title>
          <v-card-text>
            <div class="d-flex justify-left ga-2">
              <v-btn v-if="isFixedLine" :href="props.redirect.fixedline + '?locid=' + quickSq.id" size="small">Home Plans</v-btn>
              <v-btn v-if="isFixedLine" :href="props.redirect.business + '?locid=' + quickSq.id" size="small">Business Plans</v-btn>
              <v-btn v-if="isWireless" :href="props.redirect.wireless + '?locid=' + quickSq.id" class="ma-3">Fixed Wireless Plans</v-btn>
              <v-btn v-if="isSatellite" :href="props.redirect.wireless + '?locid=' + quickSq.id" class="ma-3">SkyMuster Plus Plans</v-btn>
              <v-btn v-if="quickSq.fibreUpgrade" :href="props.redirect.fixedline + '?locid=' + quickSq.id" class="ma-3">Upgrade to Fibre</v-btn>
            </div>
          </v-card-text>
        </v-card>


        <v-progress-linear
          :active="true"
          color="primary"
          height="5"
          :indeterminate="loading"
        ></v-progress-linear>
      </v-card>



      <v-dialog max-width="500" v-model="resultsDialog">
        <template v-slot:default="{ isActive }">
          <v-card title="Select your address">
            <v-card-text>
              <p>
                We found a couple of addresses that match your search for {{ addressSearchString }}.
                To continue, please select the correct address below...
              </p>

              <v-data-iterator :items="addressResults" :page="locidResultsPage">
                <template v-slot:default="{ items }">
                  <template v-for="(item) in items" :key="item.raw.value">
                    <v-btn @click="isActive.value = false; fetchLocation(item.raw.value)" block class="mt-3" variant="outlined">{{ item.raw.label }}</v-btn>
                  </template>
                </template>
                <template v-slot:footer v-if="addressResults.length > 5">
                  <v-pagination
                    v-model="locidResultsPage"
                    :length="Math.ceil(addressResults.length / 5)"
                  ></v-pagination>
                </template>
              </v-data-iterator>
            </v-card-text>

            <v-card-actions>
              <v-btn
                text="Clear Search"
                @click="resetForm()"
              ></v-btn>
              <v-spacer></v-spacer>
              <v-btn
                text="Close"
                @click="isActive.value = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>

      <pre v-if="quickSq">{{ quickSq }}</pre>
      <pre v-if="serviceQualification">{{ serviceQualification }}</pre>

    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import AddressBar from './components/AddressBar.vue';
  import { ref, watch, computed } from 'vue';

  const props = defineProps<{
    general: {
      mode: 'redirector' | 'basicinfo' | ''
    }
    redirect: {
      fixedline: string,
      wireless: string,
      satellite: string,
      enterprise: string,
      fibreUpgrade: string,

    }
  }>();

  const addressSearchString = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const searchDisabled = ref<boolean>(false);
  const addressResults = ref<{ label: string, value: string }[]>([]);
  const resultsDialog = ref<boolean>(false);
  const locidResultsPage = ref<number>(1);
  const serviceQualification = ref<any>(null);


  type Technology = 'Fibre' | 'Fibre To The Node' | 'Wireless' | 'HFC' | 'Fibre To The Curb' | 'Fibre To The Building' | 'Satellite';
  const quickSq = ref<null | {
    id: string;
    formattedAddress: string;
    newDev: boolean;
    technology: Technology;
    serviceClass: string;
    fibreUpgrade: boolean;
    eeZone: 'CBD' | 'Zone 1' | 'Zone 2' | 'Zone 3';
    eeBuild: 'A' | 'B' | 'C';
  }>(null);

  const isFixedLine = computed(() => ['Fibre', 'Fibre To The Node', 'Fibre To The Curb', 'Fibre To The Building', 'HFC'].includes(quickSq.value?.technology || ''));
  const isWireless = computed(() => ['Wireless'].includes(quickSq.value?.technology || ''));
  const isSatellite = computed(() => ['Satellite'].includes(quickSq.value?.technology || ''));
  const queryParams = computed(() => {
    if (!quickSq.value) return '';
    const params = new URLSearchParams()
    params.append('locid', quickSq.value.id);
    return params.toString();
  });

  function resetForm() {
    addressSearchString.value = '';
    addressResults.value = [];
    resultsDialog.value = false;
    serviceQualification.value = null;
    quickSq.value = null;
  }

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

    // Do redirections
    if (props.general.mode == 'redirector') {
      if (isFixedLine.value) {
        return window.location.href = props.redirect.fixedline.split('?')[0] + '?' + queryParams.value + '&' + props.redirect.fixedline.split('?')[1];
      }
      if (isWireless.value) {
        return window.location.href = props.redirect.wireless.split('?')[0] + '?' + queryParams.value + '&' + props.redirect.wireless.split('?')[1];
      }
      if (isSatellite.value) {
        return window.location.href = props.redirect.satellite.split('?')[0] + '?' + queryParams.value + '&' + props.redirect.satellite.split('?')[1];
      }
    }

  }

  const fetchLocation = async (locid: string) => {
    loading.value = true;
    const resp = await fetch('https://api.lip.net.au/nbn-sq/location/' + locid);
    const json = await resp.json();
    loading.value = false;
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

  async function newAddressSearch(searchString) {

    // Reset values if search string is empty
    if (!searchString) {
      serviceQualification.value = null;
      addressResults.value = [];
      return;
    }

    loading.value = true;

    // If search string is LOCID, fetch location
    if (searchString.match(/^LOC\d{12}$/)) {
      try {
        await fetchLocation(searchString);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    }

    // Otherwise, fetch address search
    else {
      try {
        await fetchAddressSearch(searchString);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    }

  }

  /**
   * Watch the address search string and trigger a new search when it changes
   */
  watch(addressSearchString, newAddressSearch);

</script>
