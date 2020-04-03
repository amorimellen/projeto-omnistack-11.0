import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, Image, Text, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import api from '../../services/api';

import styles from './styles';

import logoImg from '../../assets/logo.png';

export default function Incidents() {
    
    const [incidents, setIncidents] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const incidentsRef = useRef(incidents)

    const navigation = useNavigation();

    function navigateToDetail(incident) {
          navigation.navigate('Detail', { incident });
    }

    async function loadIncidents() 
    {
        
        if(loading) {
            
            return;
        }
        
        if (total > 0 && incidents.length === total) {
            return;
        }

          setLoading(true);

          const response = await api.get('incidents', {
           
            params: { page }
        });

        
        setIncidents([...incidents, ...response.data]);

        setTotal(response.headers['x-total-count']);
        
        setPage(page+1);

        setLoading(false);
    }

      useEffect(() => {
        
        loadIncidents();

        incidentsRef.current = incidents;
        
        if (incidentsRef.current.length === 0) {
            
            const searchForIncidents = setInterval(() => {
                loadIncidents();
                
                if (incidentsRef.current.length > 0) {
                    
                    clearInterval(searchForIncidents);
                }
            }, 30000);
        }
    }, [incidents]);

 
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={logoImg} />
                <Text style={styles.headerText}>
                    Total de <Text style={styles.headerTextBold}>{total} casos</Text>
                </Text>
            </View>
            <Text style={styles.title}>Bem vindo!</Text>
            <Text style={styles.description}>Escolha um dos casos abaixo e salve o dia.</Text>

            {incidents.length > 0 ? (
                <FlatList
                    style={styles.incidentList}
                    
                    data={incidents}
                    
                    keyExtractor={incident => String(incident.id)}
                    
                    showsVerticalScrollIndicator={false}
                   
                    onRefresh={loadIncidents}
                    
                    refreshing={loading}
                    
                    onEndReached={loadIncidents}
                    
                    onEndReachedThreshold={0.2}
                    
                    renderItem={({ item: incident }) => (
                        <View>
                            <View style={styles.incident}>
                                <View style={styles.groupIncidentProperties}>
                                    <View style={styles.groupIncidentPropertiesItem}>
                                        <Text style={[styles.incidentProperty, { marginTop: 0 }]}>
                                            CASO:
                                        </Text>
                                    </View>
                                    <View style={styles.groupIncidentPropertiesItem}>
                                        <Text style={[styles.incidentProperty, { marginTop: 0 }]}>
                                            ONG:
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.groupIncidentProperties}>
                                    <View style={styles.groupIncidentPropertiesItem}>
                                        <Text style={styles.incidentValue}>
                                            {incident.title}
                                        </Text>
                                    </View>
                                    <View style={styles.groupIncidentPropertiesItem}>
                                        <Text style={styles.incidentValue}>
                                            {incident.name}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.incidentProperty}>
                                    VALOR:
                                </Text>
                                <Text style={styles.incidentValue}>
                                    {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(incident.value).replace(/^(\D+)/, '$1 ')} reais
                                </Text>
                                <View
                                style={{
                                    borderBottomColor: '#ddd',
                                    borderBottomWidth: 1,
                                    marginBottom: 10,
                                }}
                                />
                                <TouchableOpacity
                                    hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                                    style={styles.detailsButton} 
                                    onPress={() => navigateToDetail(incident)}
                                >
                                    <Text style={styles.detailsButtonText}>Ver mais detalhes</Text>

                                    <Feather name="arrow-right" size={16} color="#E02041"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <View style={{
                    marginTop: 30,
                }}>
                    <Text>Não há nenhum caso para ser exibido.</Text>
                </View>
            )}
        </View>
    );
}