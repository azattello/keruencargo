import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFilials } from '../../action/filial';
import { addBulkSending, getSendings } from '../../action/sending';

const normalizeTrack = (value = '') => String(value).replace(/\s+/g, '').toUpperCase();

const Sendings = () => {
  const inputRef = useRef(null);

  const [filials, setFilials] = useState([]);
  const [selectedFilial, setSelectedFilial] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [queue, setQueue] = useState([]);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFilial, setFilterFilial] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFilials = useCallback(async () => {
    try {
      const data = await getFilials();
      const list = Array.isArray(data) ? data : [];
      const filialList = list.map(item => item.filial || item).filter(Boolean);
      setFilials(filialList);
      if (filialList.length && !selectedFilial) {
        setSelectedFilial(filialList[0]._id || filialList[0].filialId || '');
      }
    } catch (error) {
      console.error('Ошибка загрузки филиалов:', error);
    }
  }, [selectedFilial]);

  useEffect(() => {
    loadFilials();
  }, [loadFilials]);

  const loadSendings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSendings({
        search,
        filial: filterFilial,
        date: filterDate,
        page: 1,
        limit: 200
      });
      setRecords(response.items || []);
    } catch (error) {
      console.error('Ошибка загрузки отправок:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterFilial, filterDate]);

  useEffect(() => {
    loadSendings();
  }, [loadSendings]);

  const addTrackToQueue = (rawTrack) => {
    const track = normalizeTrack(rawTrack);
    if (!track) return;
    if (!selectedFilial) {
      alert('Сначала выберите филиал');
      return;
    }

    setQueue(prev => {
      if (prev.some(item => item.track === track)) {
        return prev;
      }
      return [...prev, { id: `${Date.now()}-${Math.random()}`, track }];
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleBulkInput = () => {
    const parsed = bulkText
      .split(/\n|,|\t|\r/)
      .map(item => normalizeTrack(item))
      .filter(Boolean);

    if (!parsed.length) {
      alert('Вставьте хотя бы один трек');
      return;
    }

    const uniqueTracks = parsed.filter((track, index, arr) => arr.indexOf(track) === index);
    setQueue(prev => {
      const current = new Set(prev.map(item => item.track));
      const newItems = uniqueTracks.filter(track => !current.has(track)).map(track => ({
        id: `${Date.now()}-${Math.random()}-${track}`,
        track
      }));
      return [...prev, ...newItems];
    });

    setBulkText('');
    setShowBulkInput(false);
  };

  const handleUpload = async () => {
    if (!selectedFilial) {
      alert('Укажите филиал для отправки');
      return;
    }
    if (!queue.length) {
      alert('Сначала добавьте хотя бы один трек');
      return;
    }

    try {
      const response = await addBulkSending(queue.map(item => item.track), selectedFilial, date);
      setQueue([]);
      await loadSendings();
      alert(response.message || 'Отправка добавлена');
    } catch (error) {
      alert(error.message || 'Не удалось сохранить отправку');
    }
  };

  const groupedRecords = useMemo(() => {
    return records.reduce((acc, item) => {
      const dateValue = item.date ? new Date(item.date).toISOString().slice(0, 10) : '—';
      const filialName = item.filial?.filialName || item.filial?.filialText || 'Филиал';
      const groupKey = `${dateValue}__${filialName}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          date: dateValue,
          filialName,
          items: []
        };
      }
      acc[groupKey].items.push(item);
      return acc;
    }, {});
  }, [records]);

  return (
    <div style={{ padding: '24px', width: '100%' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '28px' }}>Отправка</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <select
            value={selectedFilial}
            onChange={(e) => setSelectedFilial(e.target.value)}
            style={{ minWidth: '220px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d9e2ec' }}
          >
            <option value="">Выберите филиал</option>
            {filials.map(filial => (
              <option key={filial._id} value={filial._id}>{filial.filialName || filial.filialText}</option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #d9e2ec' }}
          />

          <button
            onClick={handleUpload}
            disabled={!queue.length || !selectedFilial}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              background: queue.length && selectedFilial ? '#28a745' : '#cbd5e1',
              color: '#fff',
              cursor: queue.length && selectedFilial ? 'pointer' : 'not-allowed',
              fontWeight: 700
            }}
          >
            Загрузить в отправку
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Сканируйте трек или введите номер"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addTrackToQueue(event.target.value);
              }
            }}
            style={{ flex: 1, padding: '14px 16px', borderRadius: '10px', border: '1px solid #d9e2ec' }}
          />
          <button
            onClick={() => addTrackToQueue(inputRef.current?.value || '')}
            style={{ padding: '14px 18px', borderRadius: '10px', border: 'none', background: '#4073ff', color: '#fff', fontWeight: 700 }}
          >
            Добавить
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #4073ff', background: showBulkInput ? '#e8f0ff' : '#fff', color: '#4073ff', fontWeight: 700 }}
          >
            {showBulkInput ? 'Скрыть' : 'Вставить из Excel'}
          </button>

          {showBulkInput && (
            <div style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 10px', color: '#475569' }}>По одному треку на строку или через запятую.</p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={'TRACK001\nTRACK002\nTRACK003'}
                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '10px', border: '1px solid #d9e2ec', resize: 'vertical' }}
              />
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button onClick={handleBulkInput} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', fontWeight: 700 }}>Добавить все</button>
                <button onClick={() => { setBulkText(''); setShowBulkInput(false); }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Отмена</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px', background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по треку или имени"
              style={{ flex: '1 1 260px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d9e2ec' }}
            />
            <select value={filterFilial} onChange={(e) => setFilterFilial(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d9e2ec' }}>
              <option value="all">Все филиалы</option>
              {filials.map(filial => (
                <option key={filial._id} value={filial._id}>{filial.filialName || filial.filialText}</option>
              ))}
            </select>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d9e2ec' }} />
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ margin: '0 0 12px' }}>Текущая очередь</h3>
          {queue.length === 0 ? (
            <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>Пусто</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {queue.map(item => (
                <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#edf2ff', color: '#1e3a8a', padding: '8px 10px', borderRadius: '999px', fontWeight: 600 }}>
                  {item.track}
                  <button onClick={() => setQueue(prev => prev.filter(entry => entry.id !== item.id))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1e3a8a', fontWeight: 700 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ margin: '0 0 12px' }}>Список отправок</h3>

          {loading ? (
            <div style={{ padding: '20px', color: '#64748b' }}>Загрузка...</div>
          ) : Object.keys(groupedRecords).length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>Нет записей</div>
          ) : (
            Object.values(groupedRecords).map(group => (
              <div key={`${group.date}-${group.filialName}`} style={{ marginBottom: '18px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#eef2ff', padding: '12px 16px', fontWeight: 700, color: '#1e3a8a' }}>
                  {group.date} • {group.filialName}
                </div>
                <div style={{ background: '#fff' }}>
                  {group.items.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', borderTop: '1px solid #eef2f7' }}>
                      <div style={{ fontWeight: 700 }}>{item.track}</div>
                      <div style={{ color: '#475569' }}>{item.source === 'bulk' ? 'Excel' : 'Сканер'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sendings;
