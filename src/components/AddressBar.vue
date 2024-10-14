<template>
  <v-autocomplete

    flat
    placeholder="Search your address..."
    persistent-placeholder
    clearable

    append-inner-icon="mdi-locate"

    menu-icon=""
    class="flex-full-width mx-1 mx-sm-0"
    density="comfortable"

    v-model="chosenSearchItem"
    :items="autocompleteItems"
    item-title="title"

    auto-select-first
    hide-no-data
    hide-selected

    theme="light"
    variant="solo"
    no-filter
    :disabled="props.disabled"
    :hide-details="true"

    autofocus

    @update:search="searchTextUpdate"

  ></v-autocomplete>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { Loader } from '@googlemaps/js-api-loader';

  // Props and Emits
  const props = defineProps(['modelValue', 'disabled']);
  const emit = defineEmits(['update:modelValue']);

  // Load Google Maps
  const loader = new Loader({
    apiKey: "AIzaSyDqVLJY7HVQWFZ1jyJhVegcE2ZkCGAH1Bs",
    version: "weekly",
    libraries: ["places"]
  });

  const GoogleACS = new Promise<google.maps.places.AutocompleteService>((resolve, reject) => {
    loader.importLibrary('places').then(({ AutocompleteService }) => {
      const ACS = new AutocompleteService();
      resolve(ACS);
    });
  });

  // Utilities
  const regexLOCID = /^LOC\d{12}$/;
  const regexStartLOCID = /^LOC\d{0,12}/;

  // Data
  const chosenSearchItem = ref<string>('');
  const autocompleteItems = ref<{title: string, value: string, props?: { prependIcon: string }}[]>([]);
  const searchText = ref<string>('');

  onMounted(() => {
    chosenSearchItem.value = props.modelValue;
    searchText.value = props.modelValue;
  });

  const updateAutocompleteItems = async () => {
    const search = searchText.value;

    // Clear Autocomplete if no search
    if (!search) {
      autocompleteItems.value = [];
      return;
    }

    // Set Autocomplete to LOCID if LOCID set
    if (regexLOCID.test(search)) {
      autocompleteItems.value = [{
        title: 'nbn Co Location ID: ' + search,
        value: search,
        props: { prependIcon: 'mdi-home-search-outline' }
      }]
      return;
    }

    // Clear Autocomplete if no search
    autocompleteItems.value = [];

    // Do nothing if search is too short
    if (search.length < 5) return;

    // Do nothing if not at least 2 parts
    if (search.split(' ').length < 2) return;

    // Use the live search text as the first option
    const splitSearch = search.split(':');
    autocompleteItems.value.push({
      title: splitSearch.length == 1 ? search : splitSearch[1],
      value: splitSearch.length == 1 ? search : splitSearch[1],
      props: {
        prependIcon: 'mdi-magnify',
      }
    });

    // Do nothing if matches start of LOCID
    if (regexStartLOCID.test(search)) return;

    // Search google for predictions
    const ACS = await GoogleACS;
    const predictionResponse = await ACS.getPlacePredictions({
      input: search,
      componentRestrictions: { country: 'au' },
      locationBias: 'IP_BIAS',
      types: ['street_address', 'premise', 'route'],
    });

    predictionResponse.predictions.forEach((prediction) => {

      // Skip if already in autocomplete
      if (autocompleteItems.value.find((item) => item.title === prediction.description)) return;

      // Add to autocomplete
      autocompleteItems.value.push({
        title: prediction.description,
        value: prediction.description,
        props: {
          prependIcon: 'mdi-map-search-outline',
        }
      });

    })

  }

  /**
   * @param val
   */
  const searchTextUpdate = (val: string) => {
    searchText.value = val;
    updateAutocompleteItems();
  };

  /**
   * Perform a search when the chosen search item changes
   */
  watch(chosenSearchItem, (val) => {
    emit('update:modelValue', val);
  });


  watch(() => props.modelValue, (val) => {
    if (!val) {
      chosenSearchItem.value = '';
    }
  });

</script>
