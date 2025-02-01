import Ionicons from '@expo/vector-icons/Ionicons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { Button, ScrollView, Sheet, Stack, Text } from 'tamagui';
import { Feed } from '~/types/feed';
import { Filter, GenderFilter } from '~/types/filter';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Filters({
  feeds,
  locations,
  initialFilters,
  ageRange,
  showFilter,
  setShowFilter,
  filters,
  setFilters,
}: {
  feeds: Feed[];
  showFilter: boolean;
  setShowFilter: (showFilter: boolean) => void;
  filters: Filter;
  initialFilters: Filter;
  setFilters: (filters: Filter) => void;
  locations: string[];
  ageRange: number[];
}) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const genderOptions: GenderFilter[] = ['Male', 'Female', 'Other', 'Both'];

  return (
    <Sheet
      modal
      open={showFilter}
      onOpenChange={() => {
        setShowFilter(!showFilter);
        setShowLocationPicker(false);
      }}
      dismissOnSnapToBottom
      snapPoints={[80]}>
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor="white" borderTopLeftRadius={40} borderTopRightRadius={40}>
        <ScrollView>
          <Stack paddingHorizontal={30} paddingVertical={20} gap={10}>
            <Stack
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              marginTop={5}
              marginBottom={10}>
              <Text
                fontSize={30}
                fontWeight="600"
                color="black"
                textAlign="center"
                marginHorizontal="auto">
                Filters
              </Text>
              <Button
                unstyled
                onPress={() => {
                  setFilters(initialFilters);
                  setShowFilter(false);
                }}>
                <Text color="#E94057" fontSize={16} fontWeight={'bold'}>
                  Clear
                </Text>
              </Button>
            </Stack>

            <Text fontSize={16} color="black" fontWeight={'bold'}>
              Interested in
            </Text>
            <Stack flexDirection="row" gap={0}>
              {genderOptions.map((option: GenderFilter, index) => (
                <Button
                  key={option}
                  backgroundColor={filters.gender === option ? '#E94057' : 'white'}
                  borderWidth={1}
                  borderColor={filters.gender === option ? '#E94057' : '#E8E8E8'}
                  color={filters.gender === option ? 'white' : 'black'}
                  borderRadius={0}
                  flex={1}
                  height={50}
                  paddingHorizontal={10}
                  borderTopLeftRadius={index === 0 ? 8 : 0}
                  borderTopRightRadius={index === genderOptions.length - 1 ? 8 : 0}
                  borderBottomLeftRadius={index === 0 ? 8 : 0}
                  borderBottomRightRadius={index === genderOptions.length - 1 ? 8 : 0}
                  pressStyle={{ backgroundColor: 'white', borderColor: '#E94057' }}
                  onPress={() => setFilters({ ...filters, gender: option })}>
                  <Text color={filters.gender === option ? 'white' : 'black'} fontSize={14}>
                    {option}
                  </Text>
                </Button>
              ))}
            </Stack>

            <Text fontSize={16} color="black" fontWeight={'bold'} marginTop={10}>
              Location
            </Text>
            <Stack>
              <Button
                backgroundColor="white"
                borderWidth={1}
                borderColor="#E8E8E8"
                height={50}
                borderRadius={8}
                onPress={() => setShowLocationPicker(!showLocationPicker)}
                justifyContent="space-between"
                flexDirection="row"
                alignItems="center"
                paddingHorizontal={15}>
                <Text color="black" fontSize={14}>
                  {filters.location}
                </Text>
                <Ionicons
                  name={showLocationPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="black"
                />
              </Button>
              {showLocationPicker && (
                <Stack
                  backgroundColor="white"
                  borderWidth={1}
                  borderColor="#E8E8E8"
                  borderRadius={8}
                  marginTop={5}
                  height={200}>
                  <ScrollView>
                    {locations.map((city) => (
                      <Button
                        key={city}
                        unstyled
                        onPress={() => {
                          setFilters({ ...filters, location: city });
                          setShowLocationPicker(false);
                        }}
                        paddingVertical={10}
                        paddingHorizontal={15}
                        backgroundColor={filters.location === city ? '#F0F0F0' : 'white'}>
                        <Text color={filters.location === city ? '#E94057' : 'black'} fontSize={16}>
                          {city}
                        </Text>
                      </Button>
                    ))}
                  </ScrollView>
                </Stack>
              )}
            </Stack>

            <Text fontSize={16} color="black" fontWeight={'bold'} marginTop={10}>
              Age Range
            </Text>
            <Stack alignItems="center" marginTop={10}>
              <MultiSlider
                values={filters.ageRange}
                min={ageRange[0]}
                max={ageRange[1]}
                step={1}
                sliderLength={SCREEN_WIDTH - 80}
                selectedStyle={{ backgroundColor: '#E94057' }}
                markerStyle={{
                  backgroundColor: '#E94057',
                  height: 20,
                  width: 20,
                }}
                onValuesChange={(values) => setFilters({ ...filters, ageRange: values })}
              />
              <Text fontSize={14} color="gray">
                {filters.ageRange[0]} - {filters.ageRange[1]} years old
              </Text>
            </Stack>

            <Button
              backgroundColor="#E94057"
              color="white"
              borderRadius={15}
              height={55}
              marginTop={20}
              onPress={() => setShowFilter(false)}>
              <Text color="white" fontWeight={'bold'}>
                Continue
              </Text>
            </Button>
          </Stack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
