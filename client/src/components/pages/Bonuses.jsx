import React from 'react';
import BasePage from './BasePage';

export default function Bonuses() {
  return (
    <BasePage title="Бонусы">
      <div className="page-card">
        <h3>Баланс бонусов</h3>
        <p>У вас 1200 бонусов. Используйте их при оформлении заказа.</p>
      </div>
    </BasePage>
  );
}
