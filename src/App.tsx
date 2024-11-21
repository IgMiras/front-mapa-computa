import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import './App.css';

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

// Componente para gerenciar eventos de carregamento do mapa
const MapEventsHandler: React.FC<{ setLoading: (loading: boolean) => void }> = ({
    setLoading,
}) => {
    const map = useMap();

    useEffect(() => {
        // Adiciona eventos de loading
        const handleLoading = () => setLoading(true);
        const handleLoad = () => setLoading(false);

        map.on('loading', handleLoading);
        map.on('load', handleLoad);

        return () => {
            map.off('loading', handleLoading);
            map.off('load', handleLoad);
        };
    }, [map, setLoading]);

    return null;
};

const App: React.FC = () => {
    const [data, setData] = useState<CursoData[]>([]);
    const [loading, setLoading] = useState(true); // Estado de carregamento
    const [mapTheme, setMapTheme] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

    useEffect(() => {
        // Fetch dos dados do endpoint
        axios
            .get<CursoData[]>('http://localhost:3000/mapa')
            .then((response) => {
                setData(response.data);
                setLoading(false); // Dados carregados
            })
            .catch((error) => {
                console.error('ERRO: ', error);
                setLoading(false); // Finaliza o carregamento mesmo com erro
            });
    }, []);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            {loading && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '1em',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                    }}
                >
                    <p>Carregando mapa...</p>
                </div>
            )}
            <MapContainer
                center={[-14.235, -51.9253]} // Centro aproximado do Brasil
                zoom={4}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer 
                    url={mapTheme}
                    attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEventsHandler setLoading={setLoading} />
                <select onChange={(e) => setMapTheme(e.target.value)}>
                    <option value="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">Claro</option>
                    <option value="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png">Escuro</option>
                </select>
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
        </div>
    );
};

export default App;
