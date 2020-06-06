import React, { useState, useEffect } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from "react-native-svg";
import * as location from 'expo-location'

import api from '../../services/api';

interface Item {
  id: number, 
  title: string, 
  image_url: string
}

interface Point { 
  id: number;
  image: string;
  image_url: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {
    
    const nav = useNavigation();
    const route = useRoute();
    
    const routeParams = route.params as Params;

    function handleNavigateBack() {
        nav.goBack();
    }

    function handleNavigateToDetail(pointId: number) {
      nav.navigate('Detail', { point_id: pointId });
    }

    function handleSelectItem(id: number) {
      const alreadySelectedItem = selectedItems.findIndex(item => {
          return item === id
      });
      if(alreadySelectedItem >= 0) {
          const filteredItems = selectedItems.filter(item => {
              return item !== id;    
          });
          setSelectedItems(filteredItems);
      } else {
          setSelectedItems([...selectedItems, id]);
      }   
    }

    const [points, setPoints] = useState<Point[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
      api.get('/items').then(response => {
        setItems(response.data);
      })
    }, []);

    useEffect(() => {
      async function loadPosition() {
        const { status } = await location.requestPermissionsAsync();
        if(status !== 'granted') {
          Alert.alert('Uops...', 'Precisamos da sua localização atual para te ajudar de forma efetiva!');
        } else {
          const actualLocation = await location.getCurrentPositionAsync();
          const { latitude, longitude } = actualLocation.coords;
          setInitialPosition([latitude, longitude]);
        }
      }

      loadPosition();

    }, []);

    useEffect(() => {
      api.get('/points', {
        params: {
          uf: routeParams.uf, 
          city: routeParams.city, 
          items: selectedItems
        }
      }).then(response => {
        setPoints(response.data);
      })
    }, [selectedItems]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"/>
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Selecione o tipo de itens para coleta nos icones abaixo do mapa para encontrar um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    
                    { initialPosition[0] != 0 && (
                      <MapView style={styles.map} 
                                  initialRegion={{ 
                                    latitude: initialPosition[0],
                                    longitude: initialPosition[1],
                                    latitudeDelta: 0.500, 
                                    longitudeDelta: 0.500
                                  }}
                        >
                          {points.map(point => (
                            <Marker 
                                style={styles.mapMarker}
                                key={String(point.id)}
                                coordinate={{ 
                                      latitude: point.latitude,
                                      longitude: point.longitude
                                }}
                                onPress={() => handleNavigateToDetail(point.id)}
                            >
                              <View style={styles.mapMarkerContainer}>
                                <Image 
                                  style={styles.mapMarkerImage} 
                                  source={{ uri: point.image_url }} 
                                />
                                <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                              </View>
                            </Marker>
                          ))}
                        </MapView>
                    ) }

                    
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {items.map(item => (
                    <TouchableOpacity 
                      style={[
                        styles.item,
                        selectedItems.includes(item.id) ? styles.selectedItem : {}
                      ]}
                      onPress={() => handleSelectItem(item.id)}
                      key={String(item.id)}
                      activeOpacity={0.6}
                    >
                      <SvgUri width={42} height={42} uri={item.image_url}/>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  
                </ScrollView>
                
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;