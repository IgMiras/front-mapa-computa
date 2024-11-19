import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';

// Tipagem dos dados do endpoint
interface CursoData {
    cidade_nome: string;
    latitude: number;
    longitude: number;
    instituicao_nome: string;
    curso_nome: string;
    notaMediaEnade: number | null;
}

// Configurar ícones padrão do Leaflet
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41], // Tamanho do ícone
    iconAnchor: [12, 41], // Posição do "ponto" do ícone
    popupAnchor: [1, -34], // Posição do popup em relação ao ícone
});

const App: React.FC = () => {
    const [data, setData] = useState<CursoData[]>([]);

    useEffect(() => {
        // Fetch dos dados do endpoint
        axios
            .get<CursoData[]>('http://localhost:3000/mapa')
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error('ERRO: ', error);
            });
    }, []);

    return (
        <MapContainer
            center={[-14.235, -51.9253]} // Centro aproximado do Brasil
            zoom={4}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <MarkerClusterGroup>
                {data.map((item, index) => (
                    <Marker
                        key={index}
                        position={[item.latitude, item.longitude]}
                        icon={customIcon}
                    >
                        <Popup>
                            <strong>Cidade:</strong> {item.cidade_nome} <br />
                            <strong>Instituição:</strong>{' '}
                            {item.instituicao_nome} <br />
                            <strong>Curso:</strong> {item.curso_nome} <br />
                            <strong>Nota Média Enade:</strong>{' '}
                            {item.notaMediaEnade ?? 'N/A'}
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default App;
