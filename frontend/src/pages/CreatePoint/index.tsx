import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet'

import './styles.css';
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    
    /*
    Ao criar um estado para um array ou objeto
    é necessário definir o tipo do objeto armazenado no estado
    */
    const [items, setItems] = useState<Item[]>([]);
    
    const [ufList, setUfList] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');

    const [cityList, setCityList] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');

    const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0]);
    const [actualLocation, setActualLocation] = useState<[number, number]>([0, 0]);

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectedFile, setSelectedFile] = useState<File>();

    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        whatsapp: ''
    });

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        const latitude = event.latlng.lat;
        const longitude = event.latlng.lng;
        setSelectedMapPosition([latitude, longitude]);
    }

    const history = useHistory();

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
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

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [ latitude, longitude ] = selectedMapPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email); 
        data.append('whatsapp', whatsapp); 
        data.append('uf', uf); 
        data.append('city', city); 
        data.append('latitude', String(latitude)); 
        data.append('longitude', String(longitude)); 
        data.append('items', items.join(','));
        if(selectedFile) {
            data.append('image', selectedFile);
        }
        
        await api.post('/points', data);
        alert('Ponto de coleta criado!');
        history.push('/');
    }

    /*
    Recebe como parametro uma função a ser executada e quando
    ela será executada. Ao passar um array vazio, será executada uma única vez
    */

    // Busca os itens possíveis de coleta
    useEffect(() => {
        api.get('/items').then(response => {
            setItems(response.data);
        })
    }, []);

    // Busca os estados através da API do IBGE
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfList(ufInitials);
        });
    }, []);

    // Busca as cidades de um determinado estado (Somente quando a UF mudar)
    useEffect(() => {
        // Não executa nada
        if(selectedUf === '0')
            return;
        
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            setCityList(cityNames);
        });
    }, [selectedUf]);

    // Busca a localização atual do usuário
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setActualLocation([position.coords.latitude, position.coords.longitude]);
        });
    }, []);

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label> 
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        ></input>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail de Contato</label> 
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            ></input>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label> 
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            ></input>
                        </div>   
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map 
                        center={actualLocation} 
                        zoom={30}
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={selectedMapPosition}/>
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectedUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufList.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div> 
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {cityList.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div> 
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>

    )
}

export default CreatePoint;