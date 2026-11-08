import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Copy, Check, Compass, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Фикс стандартных иконок Leaflet для сборщиков Vite / Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Фирменный кастомный маркер Ahk Factory
const createCustomMarker = () => {
  return L.divIcon({
    className: 'custom-ahk-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));">
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #E0B68A 0%, #C89B6D 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #FFFFFF;"></div>
        <div style="position: absolute; width: 10px; height: 10px; background: #171614; border-radius: 50%; z-index: 2;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Внутренний компонент для обработки кликов и перетаскивания маркера
function LocationMarker({ position, onPositionChange, t }) {
  const markerRef = useRef(null);

  // Слушатель клика по любой точке карты
  const map = useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      onPositionChange(newPos);
      map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 0.6 });
    },
  });

  // Слушатель завершения перетаскивания маркера
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const newPos = { lat: latLng.lat, lng: latLng.lng };
          onPositionChange(newPos);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={createCustomMarker()}
    >
      <Popup>
        <div style={{ padding: '6px', textAlign: 'center', minWidth: '160px', color: '#171614' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
            📍 {t('map_selected_point')}
          </div>
          <div style={{ fontSize: '11px', color: '#555', fontFamily: 'monospace' }}>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
            {t('map_drag_hint')}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Компонент плавного перемещения камеры карты
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { animate: true, duration: 0.8 });
    }
  }, [center, map]);
  return null;
}

/**
 * Готовый интерактивный компонент выбора местоположения на карте
 * 
 * @param {Object} props
 * @param {Object} props.initialPosition - Начальные координаты { lat, lng } (по умолчанию Ташкент)
 * @param {Function} props.onLocationSelect - Коллбек при изменении координат: ({ lat, lng, address }) => void
 * @param {number} props.height - Высота блока карты (в px)
 */
export const LocationPickerMap = ({
  initialPosition = { lat: 41.299496, lng: 69.240073 }, // Координаты по умолчанию
  onLocationSelect,
  height = 360,
  showAddress = true
}) => {
  const { t } = useLanguage();

  // Храним прямой инстанс объекта карты Leaflet
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(initialPosition);
  const [mapCenter, setMapCenter] = useState(initialPosition);
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Обратное геокодирование через бесплатный OpenStreetMap Nominatim API
  const fetchAddress = useCallback(async (lat, lng) => {
    if (!showAddress) return;
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'ru,uz,en' }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const display = data.display_name || '';
        setAddress(display);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address: display });
        }
      }
    } catch (err) {
      console.warn('Geocoding service unavailable:', err);
    } finally {
      setIsGeocoding(false);
    }
  }, [showAddress, onLocationSelect]);

  // Обновление состояния координат
  const handlePositionChange = useCallback((newPos) => {
    setPosition(newPos);
    if (onLocationSelect) {
      onLocationSelect({ lat: newPos.lat, lng: newPos.lng, address });
    }
    fetchAddress(newPos.lat, newPos.lng);
  }, [fetchAddress, onLocationSelect, address]);

  // Функция обновления координат для стейта и родительской формы
  const setCoordinates = useCallback((newCoords) => {
    setPosition(newCoords);
    setMapCenter(newCoords);
    handlePositionChange(newCoords);
  }, [handlePositionChange]);

  // Функция для получения реального местоположения пользователя
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Ваш браузер не поддерживает определение геолокации.");
      return;
    }

    setIsLocating(true);

    // Запрос реальных координат через браузерное API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("Реальные координаты устройства:", lat, lng);

        // Передаем реальные координаты в стейт или центрируем карту
        if (typeof setCoordinates === 'function') {
          setCoordinates({ lat, lng });
        }
        
        if (window.mapInstance && typeof window.mapInstance.setView === 'function') {
          window.mapInstance.setView([lat, lng], 16);
        } else if (map && typeof map.setView === 'function') {
          map.setView([lat, lng], 16);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Ошибка получения геолокации:", error);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("Доступ к геолокации заблокирован. Разрешите его в настройках браузера.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Информация о местоположении недоступна.");
            break;
          case error.TIMEOUT:
            alert("Время ожидания запроса истекло.");
            break;
          default:
            alert("Не удалось определить ваше местоположение.");
            break;
        }
      },
      {
        enableHighAccuracy: true, // Включаем высокий уровень точности (GPS)
        timeout: 10000,           // Ожидание до 10 секунд
        maximumAge: 0             // Запрещаем использовать старые кэшированные данные
      }
    );
  };

  // Копирование координат в буфер обмена
  const handleCopyCoords = () => {
    const text = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'rgba(23, 22, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200, 155, 109, 0.25)',
        borderRadius: '16px',
        padding: '16px',
        color: '#F8F6F2',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Заголовок карты и кнопка геолокации */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(200, 155, 109, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wood-light, #E0B68A)'
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8F6F2' }}>
              {t('map_title')}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(248, 246, 242, 0.6)' }}>
              {t('map_hint')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isLocating ? 'rgba(200, 155, 109, 0.3)' : 'rgba(200, 155, 109, 0.18)',
            border: '1px solid rgba(200, 155, 109, 0.4)',
            color: '#E0B68A',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isLocating ? 'wait' : 'pointer',
            opacity: isLocating ? 0.75 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => !isLocating && (e.currentTarget.style.background = 'rgba(200, 155, 109, 0.3)')}
          onMouseLeave={(e) => !isLocating && (e.currentTarget.style.background = 'rgba(200, 155, 109, 0.18)')}
        >
          {isLocating ? (
            <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Navigation size={14} />
          )}
          <span>{isLocating ? 'Aniqlanmoqda...' : t('map_my_location')}</span>
        </button>
      </div>

      {geoError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#F87171',
            background: 'rgba(248, 113, 113, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}
        >
          <AlertCircle size={14} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Окно карты Leaflet */}
      <div
        style={{
          height: `${height}px`,
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}
      >
        <MapContainer
          ref={(instance) => {
            setMap(instance);
            if (typeof window !== 'undefined') {
              window.mapInstance = instance;
            }
          }}
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          {/* Слой тайлов OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Интерактивный маркер с поддержкой Drag-and-Drop и Click */}
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
            t={t}
          />

          <MapFlyTo center={mapCenter} />
        </MapContainer>
      </div>

      {/* Отображение зарегистрированных в state координат */}
      <div
        style={{
          marginTop: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px'
        }}
      >
        {/* Карточка Широты */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(248, 246, 242, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('map_latitude')}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#E0B68A', fontFamily: 'monospace', marginTop: '2px' }}>
            {position.lat.toFixed(6)}
          </div>
        </div>

        {/* Карточка Долготы */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(248, 246, 242, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('map_longitude')}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#E0B68A', fontFamily: 'monospace', marginTop: '2px' }}>
            {position.lng.toFixed(6)}
          </div>
        </div>
      </div>

      {/* Адрес и кнопка быстрого копирования */}
      <div
        style={{
          marginTop: '10px',
          padding: '10px 14px',
          background: 'rgba(200, 155, 109, 0.06)',
          border: '1px dashed rgba(200, 155, 109, 0.25)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <MapPin size={16} color="#E0B68A" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#F8F6F2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isGeocoding ? (
              <span style={{ color: 'rgba(248, 246, 242, 0.6)' }}>{t('map_resolving_address')}</span>
            ) : address ? (
              address
            ) : (
              `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCoords}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: copied ? '#34D399' : 'rgba(248, 246, 242, 0.7)',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            flexShrink: 0,
            transition: 'color 0.2s'
          }}
          title={t('map_copy')}
        >
          {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
          <span>{copied ? t('map_copied') : t('map_copy')}</span>
        </button>
      </div>
    </div>
  );
};

export default LocationPickerMap;
