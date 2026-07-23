import React, { useState, useCallback, useRef } from "react";
import config from "../../config";
import './css/AddTrackToClient.css';

const AddTrackToClient = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const debounceTimer = useRef(null);

  // Debounced поиск пользователей
  const debouncedSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${config.apiUrl}/api/user/admin/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при поиске");
        }

        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery("");
    setError("");
  };

  const handleChangeUser = () => {
    if (tracks.length > 0) {
      if (window.confirm("Введенные треки будут удалены. Продолжить?")) {
        setSelectedUser(null);
        setTracks([]);
        setCurrentTrack("");
        setError("");
        setSuccess("");
      }
    } else {
      setSelectedUser(null);
      setTracks([]);
      setCurrentTrack("");
      setError("");
      setSuccess("");
    }
  };

  const handleAddTrack = () => {
    const trimmed = currentTrack.trim();
    if (!trimmed) return;

    // Добавить и удалить дубликаты
    const newTracks = [...tracks, trimmed];
    const uniqueTracks = [...new Set(newTracks)];

    setTracks(uniqueTracks);
    setCurrentTrack("");
  };

  const handleTrackKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTrack();
    }
  };

  const handleRemoveTrack = (index) => {
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError("Выберите клиента");
      return;
    }

    if (tracks.length === 0) {
      setError("Добавьте хотя бы один трек");
      return;
    }

    if (tracks.length > 200) {
      setError("Максимум 200 треков за раз");
      return;
    }

    if (!window.confirm(`Добавить ${tracks.length} треков пользователю ${selectedUser.name} ${selectedUser.surname}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/user/${selectedUser._id}/bookmarks/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracks: tracks,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при добавлении треков");
      }

      const data = await response.json();
      setSuccess(data.message);
      setTracks([]);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mainAdmin">
    <div className="add-track-to-client">
      <div className="warehouse-container">
        <div className="warehouse-header">
          <h1>Добавить треки клиенту</h1>
          <p>Найдите клиента и добавьте трек-номера в его закладки</p>
        </div>

        <div className="add-track-content">
          {/* Шаг 1: Поиск клиента */}
          <div className="step-section">
            <div className="step-header">
              <div className="step-number">1</div>
              <h3>Найти клиента</h3>
            </div>

            {!selectedUser ? (
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Телефон, имя, фамилия или ID"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />

                {loading && <div className="loading">Поиск...</div>}

                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="user-result"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="user-info">
                          <p className="user-name">{user.name} {user.surname}</p>
                          <p className="user-phone">{user.phone}</p>
                          <p className="user-id">ID: {user.personalId}</p>
                        </div>
                        <button className="select-btn">Выбрать</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="selected-user-card">
                <div className="user-details">
                  <h4>Выбранный клиент:</h4>
                  <p><strong>Имя:</strong> {selectedUser.name} {selectedUser.surname}</p>
                  <p><strong>Телефон:</strong> {selectedUser.phone}</p>
                  <p><strong>ID:</strong> {selectedUser.personalId}</p>
                </div>
                <button
                  onClick={handleChangeUser}
                  className="change-user-btn"
                >
                  Сменить клиента
                </button>
              </div>
            )}
          </div>

          {/* Шаг 2: Добавление треков */}
          {selectedUser && (
            <div className="step-section">
              <div className="step-header">
                <div className="step-number">2</div>
                <h3>Добавить треки</h3>
              </div>

              <div className="track-input-section">
                <div className="track-input-group">
                  <input
                    type="text"
                    placeholder="Введите номер трека и нажмите Enter"
                    value={currentTrack}
                    onChange={(e) => setCurrentTrack(e.target.value)}
                    onKeyPress={handleTrackKeyPress}
                    className="track-input"
                    disabled={loading}
                  />
                  <button
                    onClick={handleAddTrack}
                    disabled={!currentTrack.trim() || loading}
                    className="add-track-btn"
                  >
                    Добавить
                  </button>
                </div>

                {tracks.length > 0 && (
                  <div className="tracks-list">
                    <h4>Добавленные треки ({tracks.length}):</h4>
                    <div className="tracks-chips">
                      {tracks.map((track, index) => (
                        <div key={index} className="track-chip">
                          <span>{track}</span>
                          <button
                            onClick={() => handleRemoveTrack(index)}
                            className="remove-chip"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="submit-section">
                  <button
                    onClick={handleSubmit}
                    disabled={tracks.length === 0 || loading}
                    className="submit-btn"
                  >
                    {loading ? "Добавляю..." : `Добавить ${tracks.length} треков`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Сообщения */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
      </div>
    </div>
    </div>
  );
};

export default AddTrackToClient;
