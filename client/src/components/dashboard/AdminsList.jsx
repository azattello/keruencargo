import React, { useState, useEffect } from "react";
import config from "../../config";
import './css/AdminsList.css';

const AdminsList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // all, admin, filial

  // Загрузка администраторов и филиалов
  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // Загружаем админов
      let adminsResponse = await fetch(
        `${config.apiUrl}/api/user/admins`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!adminsResponse.ok) {
        throw new Error("Ошибка при загрузке администраторов");
      }

      let adminsData = await adminsResponse.json();

      // Фильтруем по роли
      if (filterRole !== "all") {
        adminsData = adminsData.filter(admin => 
          filterRole === "admin" ? admin.role === "admin" : admin.role === "filial"
        );
      }

      setAdmins(adminsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    return role === "admin" ? "Администратор" : "Филиал";
  };

  return (
    <div className="admins-list">
      <h2>Администраторы и филиалы</h2>

      <div className="controls">
        <div className="filter-group">
          <label>Фильтр по роли:</label>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            disabled={loading}
          >
            <option value="all">Все</option>
            <option value="admin">Администраторы</option>
            <option value="filial">Филиалы</option>
          </select>
        </div>
        <button 
          onClick={loadAdmins} 
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? "Загрузка..." : "🔄 Обновить"}
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {admins.length > 0 ? (
        <div className="admins-grid">
          {admins.map((admin) => (
            <div key={admin._id} className="admin-card">
              <div className="card-header">
                <div className="role-badge" style={{backgroundColor: admin.role === "admin" ? "#3498db" : "#2ecc71"}}>
                  {getRoleLabel(admin.role)}
                </div>
                <div className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                  {admin.isActive ? "Активен" : "Неактивен"}
                </div>
              </div>

              <div className="card-content">
                <h3>{admin.name} {admin.surname}</h3>
                
                <div className="info-row">
                  <span className="label">📱 Телефон:</span>
                  <span className="value">{admin.phone}</span>
                </div>

                <div className="info-row">
                  <span className="label">📧 Email:</span>
                  <span className="value">{admin.email || "Не указан"}</span>
                </div>

                {admin.role === "filial" && admin.filialName && (
                  <div className="info-row">
                    <span className="label">🏢 Филиал:</span>
                    <span className="value">{admin.filialName}</span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">🆔 ID:</span>
                  <span className="value">{admin.personalId}</span>
                </div>

                <div className="info-row">
                  <span className="label">📅 Регистрация:</span>
                  <span className="value">
                    {new Date(admin.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {admin.role === "admin" && (
                  <div className="info-row">
                    <span className="label">🔐 Текущий супер-админ:</span>
                    <span className="value">{admin.isSuperAdmin ? "Да" : "Нет"}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button className="edit-btn">✏️ Редактировать</button>
                {admin.isActive && (
                  <button className="deactivate-btn">🔒 Деактивировать</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{loading ? "Загрузка..." : "Администраторы не найдены"}</p>
        </div>
      )}
    </div>
  );
};

export default AdminsList;
