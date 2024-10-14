<template>
  <v-sheet>

    <AddressBar v-model="addressSearchString" :loading="loading" :disabled="loading || searchDisabled"/>


    <div>{{ addressSearchString }}</div>
    <pre>{{ serviceQualification }}</pre>
    <div>Results: {{ addressResults }}</div>
  </v-sheet>
</template>

<script setup lang="ts">
  import AddressBar from './components/AddressBar.vue';
  import { ref, watch } from 'vue';

  const addressSearchString = ref<string>('');
  const loading = ref<boolean>(false);
  const searchDisabled = ref<boolean>(false);
  const serviceQualification = ref<any>(null);
  const addressResults = ref<any>(null);
  const quickSq = ref<null | {
    technology: string,
    serviceClass: string,
    fibreUpgrade: boolean,
  }>(null);

  const handleLocation = async (data: any) => {
    serviceQualification.value = data;
    quickSq.value = {
      technology: data.primaryTechnology.supportingTechnology.primaryAccessTechnology,
      serviceClass: data.primaryTechnology.supportingTechnology.serviceabilityClass,
      fibreUpgrade: data.primaryTechnology.supportingTechnology.alternativeTechnology == 'Fibre',
    }
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

    addressResults.value = data;
  }

  watch(addressSearchString, async (searchString) => {

    // Reset values if search string is empty
    if (!searchString) {
      serviceQualification.value = null;
      addressResults.value = null;
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
</script>
