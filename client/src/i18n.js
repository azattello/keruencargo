// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  kz: {
    translation: {
      home: {
        title: "Басты бет",
        description: "Бұл біздің веб-сайтымыздың басты беті."
      },
      about: {
        title: "Біз туралы",
        description: "Компаниямыз туралы толығырақ біліңіз."
      },
      contact: {
        title: "Байланыс",
        description: "Бізбен байланысу үшін осы жерді пайдаланыңыз."
      },
      menu: {
        instruction: "Нұсқаулық",
        branches: "Филиалдар",
        warehouseAddress: "Қойманың мекенжайы",
        lostItems: "Жоғалған тауарлар",
        contacts: "Байланыс",
        copy: "Көшіру",
        aboutUs: "Біз туралы",
        prohibitedItems: "Тапсырыс беруге болмайтын тауарлар",
        home: "Басты бет",
        parcels: "Сәлемдемелер",
        profile: "Аккаунт",
        myParcels: "Менің тауарларым",
        addTrack: "Трек қосу",
        archive: "Мұрағат",
        allParcels: "Барлық сәлемдемелер",
        settings: "Параметрлер",
        currentPassword: "Ағымдағы пароль",
        newPassword: "Жаңа пароль",
        changePassword: "Құпия сөзді өзгерту",
        close: "Жабу",
        dashboard: "Басқару тақтасы",
        logout: "Шығу",
        about: "Сипаттама",
        moreTrack: "Барлық тауарлар",
        passwd: "Құпия сөз"
      }
    }
  },
  cn: {
    translation: {
      home: {
        title: "首页",
        description: "这是我们网站的主页。"
      },
      about: {
        title: "关于我们",
        description: "了解更多关于我们公司的信息。"
      },
      contact: {
        title: "联系方式",
        description: "通过此处与我们联系。"
      },
      menu: {
        instruction: "说明",
        branches: "分支",
        warehouseAddress: "仓库地址",
        lostItems: "遗失物品",
        contacts: "联系方式",
        copy: "复制",
        aboutUs: "关于我们",
        prohibitedItems: "禁止订购的物品",
        home: "首页",
        parcels: "包裹",
        profile: "个人资料",
        myParcels: "我的包裹",
        addTrack: "添加包裹",
        archive: "存档",
        allParcels: "所有包裹",
        settings: "设置",
        currentPassword: "当前密码",
        newPassword: "新密码",
        changePassword: "更改密码",
        close: "关闭",
        dashboard: "管理面板",
        logout: "退出",
        about: "描述",
        moreTrack: "更多包裹",
        passwd: "密码"
      },
      warehouse: {
        title: "仓库",
        trackerTitle: "添加运单",
        scanPlaceholder: "扫描运单...",
        uploadButton: "上传",
        clearList: "清空列表",
        removeDuplicates: "删除重复项",
        noTracks: "没有扫描的运单",
        chooseDate: "请选择日期",
        noTracksError: "没有可上传的运单",
        success: "上传成功！",
        statusOption: "已到达中国仓库",
        tracksCount: "运单"
      }
    }
  },
  ru: {
    translation: {
      home: {
        title: "Главная",
        description: "Это главная страница нашего сайта."
      },
      about: {
        title: "О нас",
        description: "Узнайте больше о нашей компании."
      },
      contact: {
        title: "Контакты",
        description: "Свяжитесь с нами здесь."
      },
      menu: {
        instruction: "Инструкция",
        branches: "Филиалы",
        warehouseAddress: "Адрес склада",
        lostItems: "Потеряшки",
        contacts: "Контакты",
        copy: "Копировать",
        aboutUs: "О нас",
        prohibitedItems: "Товары, которые нельзя заказывать",
        home: "Главная",
        parcels: "Посылки",
        profile: "Аккаунт",
        myParcels: "Мои посылки",
        addTrack: "Добавить трек",
        archive: "Архив",
        allParcels: "Все посылки",
        settings: "Настройки",
        currentPassword: "Текущий пароль",
        newPassword: "Новый пароль",
        changePassword: "Сменить пароль",
        close: "Закрыть",
        dashboard: "Панель управления",
        logout: "Выйти",
        about: "Описание",
        moreTrack: "Все посылки",
        passwd: "Пароль"
      }
    }
  }
};

i18n
  .use(LanguageDetector) // Автоопределение языка пользователя
  .use(initReactI18next) // Инициализация для использования с React
  .init({
    resources,
    fallbackLng: "ru", // Язык по умолчанию
    detection: {
      // Настройка для использования localStorage
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'] // Сохраняем язык в localStorage
    },
    interpolation: {
      escapeValue: false // React уже делает экранирование
    }
  });

export default i18n;
