import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Linking } from 'react-native';
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RectButton } from 'react-native-gesture-handler'
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer';

interface Params {
  point_id: number;
}

interface Point {
  point: {
    id: number;
    name: string;
    image: string;
    image_url: string;
    uf: string;
    city: string;
    email: string;
    whatsapp: string;
  };

  items: {
    title: string;
  }[]
}

const Detail = () => {
    
    const nav = useNavigation();
    const route = useRoute();
    const routeParams = route.params as Params;

    const [point, setPoint] = useState<Point>({} as Point);

    function handleComposeMail() {
      MailComposer.composeAsync({
        subject: 'Ref. Coleta de Resíduos - Ecoleta',
        recipients: [point.point.email],
      });
    }

    function handleWhatsApp() {
      Linking.openURL(`whatsapp://send?phone=${point.point.whatsapp}&text=Olá, encontrei vocês através do Ecoleta e tenho interesse na coleta de resíduos.`);
    }

    function handleNavigateBack() {
        nav.goBack();
    }

    useEffect(() => {
      api.get(`/points/${routeParams.point_id}`).then(response => {
        setPoint(response.data);
      })
    }, []);

    if(!point.point) {
      return null;
    }
    
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}> 
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"/>
                </TouchableOpacity>
                <Image style={styles.pointImage} source={{ uri: point.point.image_url }} />
                <Text style={styles.pointName}>{point.point.name}</Text>
                <Text style={styles.pointItems}>{point.items.map(item => item.title).join(', ')}</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço:</Text>
                    <Text style={styles.addressContent}>{`${point.point.city}, ${point.point.uf}`}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton 
                    style={styles.button}
                    onPress={handleWhatsApp}
                >
                    <FontAwesome name="whatsapp" size={20} color="#FFF"></FontAwesome>
                    <Text style={styles.buttonText}>WhatsApp</Text>
                </RectButton>
                <RectButton 
                    style={styles.button}
                    onPress={handleComposeMail}
                >
                    <Icon name="mail" size={20} color="#FFF"></Icon>
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>

                
            </View>

            <View style={styles.footer}>
                <RectButton 
                    style={styles.buttonOrder}
                    onPress={() => {}}
                >
                    <FontAwesome name="home" size={20} color="#FFF"></FontAwesome>
                    <Text style={styles.buttonText}>Solicitar coleta na residencia</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      paddingTop: 20,
    },
  
    pointImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
      borderRadius: 10,
      marginTop: 32,
    },
  
    pointName: {
      color: '#322153',
      fontSize: 28,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    pointItems: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    address: {
      marginTop: 32,
    },
    
    addressTitle: {
      color: '#322153',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
  
    addressContent: {
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: '#999',
      paddingVertical: 20,
      paddingHorizontal: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    
    button: {
      width: '48%',
      backgroundColor: '#34CB79',
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },

    buttonOrder: {
        width: '100%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      },
  
    buttonText: {
      marginLeft: 8,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
    },
  });

export default Detail;