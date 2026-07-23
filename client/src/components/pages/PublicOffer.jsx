import React, { useState } from 'react';
import '../styles/public-offer.css';

export default function PublicOffer() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="public-offer-container">
      <div className="public-offer-content">
        
        {/* Header */}
        <div className="offer-header">
          <h1>ПУБЛИЧНАЯ ОФЕРТА</h1>
          <h2>о предоставлении логистических услуг физическим лицам</h2>
          <h3>от Ak-Dani Cargo</h3>
          <p className="offer-subtitle">(ИП Ak Dani, ИИН: 900724401712)</p>
        </div>

        {/* Introduction */}
        <div className="offer-intro">
          <p>
            Настоящий документ является публичной офертой (предложением) заключить договор на оказание логистических услуг с ИП Ak Dani (далее – Поставщик, Ak-Dani Cargo).
          </p>
          <p>
            Любое физическое лицо (далее – Покупатель), зарегистрировавшееся на сайте Поставщика и/или оформившее заказ, считается полностью и безоговорочно принявшим условия настоящей оферты.
          </p>
        </div>

        <hr className="section-divider" />

        {/* 1. ПРЕДМЕТ ОФЕРТЫ */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('subject')}>
            <h3>1. ПРЕДМЕТ ОФЕРТЫ</h3>
            <span className={`toggle-icon ${expandedSection === 'subject' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'subject' && (
            <div className="section-content">
              <div className="subsection">
                <p><strong>1.1.</strong> Поставщик обязуется оказать услуги по доставке (перевозке) грузов, заказанных Покупателем в интернет-магазинах Китая, до складов Ak-Dani Cargo на территории Республики Казахстан.</p>
              </div>
              <div className="subsection">
                <p><strong>1.2.</strong> Покупатель обязуется самостоятельно забрать доставленный товар со склада и оплатить услуги доставки в порядке, установленном настоящей офертой.</p>
              </div>
              <div className="subsection">
                <p><strong>1.3.</strong> Доставка осуществляется только до склада Ak-Dani Cargo. Доставка до адреса Покупателя не производится.</p>
              </div>
              <div className="subsection">
                <p><strong>1.4.</strong> Поставщик не вскрывает упаковку товара, не проверяет его комплектность и не несёт ответственности за содержимое отправления.</p>
              </div>
              <div className="subsection">
                <p><strong>1.5.</strong> Ak-Dani Cargo не оказывает консультационных, обучающих или посреднических услуг, не связанных напрямую с логистикой.</p>
              </div>
              <div className="subsection">
                <p><strong>1.6.</strong> Покупатель обязуется не заказывать товары, запрещённые к ввозу. Перечень запрещённых товаров размещён на сайте Поставщика в разделе «Запрещённые товары к ввозу». В случае выявления запрещённого товара все штрафы, издержки и последствия несёт Покупатель.</p>
              </div>
              <div className="subsection">
                <p><strong>1.7.</strong> Покупатель несёт полную ответственность за доставку товара от продавца до китайского склада и за корректность данных до момента поступления груза в логистическую цепочку Ak-Dani Cargo.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* 2. УСЛОВИЯ ДОСТАВКИ И ПРИЁМА */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('delivery')}>
            <h3>2. УСЛОВИЯ ДОСТАВКИ И ПРИЁМА</h3>
            <span className={`toggle-icon ${expandedSection === 'delivery' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'delivery' && (
            <div className="section-content">
              <div className="subsection">
                <p><strong>2.1.</strong> Срок доставки товара из Китая до склада в Республике Казахстан составляет от 8 до 16 дней, не включая форс-мажорные обстоятельства (работа таможенных органов, проверки, праздничные дни и иные независящие от Поставщика факторы). В случае форс-мажора срок доставки может быть увеличен до 30 дней.</p>
              </div>
              <div className="subsection">
                <p><strong>2.2.</strong> Срок доставки отсчитывается с момента фактической отгрузки со склада в Китае, а не с даты покупки или оплаты товара.</p>
              </div>
              <div className="subsection">
                <p><strong>2.3.</strong> Покупатель обязан в день получения уведомления о поступлении товара на склад:</p>
                <ul className="bullet-list">
                  <li>явиться за получением товара;</li>
                  <li>произвести оплату услуг доставки;</li>
                  <li>проверить количество и внешнюю целостность упаковки.</li>
                </ul>
              </div>
              <div className="subsection">
                <p><strong>2.4.</strong> Если Покупатель не забрал товар в течение 3 календарных дней, начиная с 4-го дня начисляется плата за хранение — 500 (пятьсот) тенге за каждый день просрочки.</p>
              </div>
              <div className="subsection">
                <p><strong>2.5.</strong> Хрупкий товар (стекло, электроника, зеркала, керамика, люстры и иные подобные товары) должен быть упакован в деревянную обрешётку по инициативе Покупателя. При отсутствии обрешётки Поставщик не несёт ответственности за повреждения такого груза.</p>
              </div>
              <div className="subsection">
                <p><strong>2.6.</strong> Ответственность Поставщика распространяется исключительно на товары, доставленные в адрес складов Ak-Dani Cargo. Грузы, отправленные на иные адреса либо вне логистической цепочки Поставщика, ответственности не подлежат.</p>
              </div>
              <div className="subsection">
                <p><strong>2.7.</strong> Поставщик вправе отказать в приёме груза, если:</p>
                <ul className="bullet-list">
                  <li>адрес доставки не соответствует указанным на сайте;</li>
                  <li>груз доставлен сторонними перевозчиками вне установленной цепочки;</li>
                  <li>упаковка или документы содержат недостоверные либо нарушающие требования данные.</li>
                </ul>
              </div>
              <div className="subsection">
                <p><strong>2.8.</strong> Покупатель обязан самостоятельно отслеживать товар через сайт отслеживания Ak-Dani Cargo и внести корректный трек-код в течение 7 календарных дней. При отсутствии отслеживания и/или трек-кода Поставщик не несёт ответственности за дальнейшую обработку и доставку груза.</p>
              </div>
              <div className="subsection">
                <p><strong>2.9.</strong> Страхование груза осуществляется по желанию Покупателя за дополнительную плату. При отсутствии страховки Поставщик не несёт ответственности за утрату, повреждение или недостачу груза, за исключением случаев прямой вины Поставщика.</p>
              </div>
              <div className="subsection">
                <p><strong>2.10.</strong> В случае если Покупатель не забрал и не оплатил товар в течение 30 календарных дней с момента уведомления о поступлении на склад, Поставщик оставляет за собой право реализовать товар третьим лицам для возмещения понесённых убытков, включая хранение, логистику и иные расходы.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* 3. ОТВЕТСТВЕННОСТЬ СТОРОН */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('responsibility')}>
            <h3>3. ОТВЕТСТВЕННОСТЬ СТОРОН</h3>
            <span className={`toggle-icon ${expandedSection === 'responsibility' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'responsibility' && (
            <div className="section-content">
              <div className="subsection">
                <p><strong>3.1.</strong> Поставщик не несёт ответственности за:</p>
                <ul className="bullet-list">
                  <li>ошибки в адресе или данных, допущенные Покупателем;</li>
                  <li>действия продавцов и интернет-магазинов;</li>
                  <li>повреждение хрупкого товара без обрешётки;</li>
                  <li>задержки, вызванные таможней, праздниками, проверками;</li>
                  <li>качество, брак, несоответствие товара ожиданиям Покупателя.</li>
                </ul>
              </div>
              <div className="subsection">
                <p><strong>3.2.</strong> Все претензии к продавцам и интернет-магазинам Покупатель урегулирует самостоятельно. Поставщик может оказать содействие при возможности, но не обязан этого делать.</p>
              </div>
              <div className="subsection">
                <p><strong>3.3.</strong> Компенсации за задержки, возникшие не по вине Поставщика, не предоставляются.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* 4. ПРИНЯТИЕ ОФЕРТЫ */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('acceptance')}>
            <h3>4. ПРИНЯТИЕ ОФЕРТЫ</h3>
            <span className={`toggle-icon ${expandedSection === 'acceptance' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'acceptance' && (
            <div className="section-content">
              <div className="subsection">
                <p><strong>4.1.</strong> Принятие оферты осуществляется:</p>
                <ul className="bullet-list">
                  <li>при регистрации на сайте Ak-Dani Cargo;</li>
                  <li>при оформлении заявки или заказа;</li>
                  <li>при передаче данных через мессенджеры или иные каналы связи.</li>
                </ul>
              </div>
              <div className="subsection">
                <p><strong>4.2.</strong> Любое из указанных действий приравнивается к подписанию договора.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* 5. СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('privacy')}>
            <h3>5. СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ</h3>
            <span className={`toggle-icon ${expandedSection === 'privacy' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'privacy' && (
            <div className="section-content">
              <div className="subsection">
                <p>Принимая условия настоящей оферты, Покупатель даёт согласие ИП Ak Dani на сбор, хранение и обработку своих персональных данных в соответствии с законодательством Республики Казахстан.</p>
              </div>
              <div className="subsection">
                <p>Персональные данные используются исключительно для оказания логистических услуг, связи с Покупателем, оформления, отслеживания и выдачи заказов.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* 6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('final')}>
            <h3>6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h3>
            <span className={`toggle-icon ${expandedSection === 'final' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'final' && (
            <div className="section-content">
              <div className="subsection">
                <p><strong>6.1.</strong> Оферта действует бессрочно и может быть изменена Поставщиком в одностороннем порядке. Актуальная версия размещается на сайте и вступает в силу с момента публикации.</p>
              </div>
              <div className="subsection">
                <p><strong>6.2.</strong> Все споры разрешаются путём переговоров, а при невозможности — в соответствии с законодательством Республики Казахстан.</p>
              </div>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* РЕКВИЗИТЫ */}
        <section className="offer-section">
          <div className="section-header" onClick={() => toggleSection('details')}>
            <h3>РЕКВИЗИТЫ ПОСТАВЩИКА</h3>
            <span className={`toggle-icon ${expandedSection === 'details' ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSection === 'details' && (
            <div className="section-content details-content">
              <p><strong>ИП Ak Dani</strong></p>
              <p><strong>ИИН:</strong> 900724401712</p>
              <p><strong>Торговая марка:</strong> Ak-Dani Cargo</p>
              <p><strong>E-mail:</strong> Araika_ukg90@mail.ru</p>
              <p><strong>Тел./WhatsApp:</strong> +7 702 778 17 34</p>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* Back Button */}
        <div className="offer-footer">
          <a href="/" className="back-link">← Вернуться на главную</a>
        </div>

      </div>
    </div>
  );
}
