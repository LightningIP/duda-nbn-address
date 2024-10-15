<template>
  <div>
    <v-card density="compact" variant="outlined" hover>

      <!-- Address Bar -->
      <AddressBar v-model="addressSearchString" :disabled="loading || searchDisabled" :autofocus="!props.inEditor"
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

      <!-- Quick SQ Results -->
      <v-card v-if="quickSq" flat :title="quickSq.formattedAddress">
        <v-card-text v-if="buttons.length">
          <div class="d-flex justify-left ga-2">
            <v-btn v-for="button in buttons" :href="button.href" size="small">{{ button.label }}</v-btn>
          </div>
        </v-card-text>
        <template v-slot:append>
          <v-btn @click="resetForm()" variant="plain" color="danger"><v-icon>mdi-close-circle-outline</v-icon></v-btn>
        </template>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed, defineProps } from 'vue';
  import { AppProps, TechnologyOption, TechnologyType } from './types';

  const props = defineProps<AppProps>();

  const addressSearchString = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const searchDisabled = ref<boolean>(false);
  const addressResults = ref<{ label: string, value: string }[]>([]);
  const resultsDialog = ref<boolean>(false);
  const locidResultsPage = ref<number>(1);
  const serviceQualification = ref<any>(null);
  const buttons = ref<{ label: string, href: string }[]>([]);

  const quickSq = ref<null | {
    id: string;
    formattedAddress: string;
    newDev: boolean;
    technology: TechnologyType;
    serviceClass: string;
    fibreUpgrade: boolean;
    eeZone: 'CBD' | 'Zone 1' | 'Zone 2' | 'Zone 3';
    eeBuild: 'A' | 'B' | 'C';
  }>(null);

  //const isFixedLine = computed(() => ['Fibre', 'Fibre To The Node', 'Fibre To The Curb', 'Fibre To The Building', 'HFC'].includes(quickSq.value?.technology || ''));
  //const isWireless = computed(() => ['Wireless'].includes(quickSq.value?.technology || ''));
  //const isSatellite = computed(() => ['Satellite'].includes(quickSq.value?.technology || ''));

  const queryParams = computed(() => {
    if (!quickSq.value) return '';
    const params = new URLSearchParams()
    params.append('locid', quickSq.value.id);
    return params.toString();
  });

  function resetForm() {
    addressSearchString.value = null;
    addressResults.value = [];
    resultsDialog.value = false;
    serviceQualification.value = null;
    quickSq.value = null;
  }

  function performTechAction(techOpts: TechnologyOption) {

    if (techOpts.action == 'redirect') {
      window.location.href = techOpts.link + '?' + queryParams.value;
    }

    else if (techOpts.action == 'button' && techOpts.link) {

      const [ link, ...existingParams ] = techOpts.link.raw_url.split('?');

      const fullLink = link + '?' + existingParams.join('&') + '&' + queryParams.value;

      buttons.value.push({
        label: techOpts.name,
        href: fullLink,
      });
    }

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

    buttons.value = [];

    if (props.mode == 'fulllookup') {
      alert('Full SQ Check still to be implemented');
    }

    else if (props.mode == 'quicklookup') {

      const fixedLineTechs = ['Fibre', 'Fibre To The Node', 'Fibre To The Curb', 'Fibre To The Building', 'HFC'];

      // loop through each of the techOpts
      for (const techOpts of props.techOpts) {

        if (techOpts.tech == 'FixedLine') {
          if (fixedLineTechs.includes(quickSq.value.technology)) {
            performTechAction(techOpts);
          }
        }

        else if (techOpts.tech == 'Wireless') {
          if (quickSq.value.technology == 'Wireless') {
            performTechAction(techOpts);
          }
        }

        else if (techOpts.tech == 'Satellite') {
          if (quickSq.value.technology == 'Satellite') {
            performTechAction(techOpts);
          }
        }

        else if (techOpts.tech == 'Enterprise') {
          if (quickSq.value.eeZone || quickSq.value.eeBuild) {
            performTechAction(techOpts);
          }
        }

        else if (techOpts.tech == 'FibreUpgrade') {
          if (quickSq.value.fibreUpgrade) {
            performTechAction(techOpts);
          }
        }

        else if (techOpts.tech == 'HighSpeedFW') {
          if (quickSq.value.technology == 'Wireless') {
            performTechAction(techOpts);
          }
        }

      }




    }

    else {
      alert('Invalid mode');
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

  async function newAddressSearch(searchString: string) {

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
  watch(addressSearchString, (val) => {
    if (val) { newAddressSearch(val); }
  });

</script>
