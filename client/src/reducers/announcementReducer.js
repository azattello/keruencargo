import {
  FETCH_ANNOUNCEMENTS_REQUEST,
  FETCH_ANNOUNCEMENTS_SUCCESS,
  FETCH_ANNOUNCEMENTS_ERROR,
  CREATE_ANNOUNCEMENT_REQUEST,
  CREATE_ANNOUNCEMENT_SUCCESS,
  CREATE_ANNOUNCEMENT_ERROR,
  UPDATE_ANNOUNCEMENT_REQUEST,
  UPDATE_ANNOUNCEMENT_SUCCESS,
  UPDATE_ANNOUNCEMENT_ERROR,
  DELETE_ANNOUNCEMENT_REQUEST,
  DELETE_ANNOUNCEMENT_SUCCESS,
  DELETE_ANNOUNCEMENT_ERROR,
} from '../action/announcement';

const initialState = {
  announcements: [],
  loading: false,
  error: null
};

export default function announcementReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ANNOUNCEMENTS_REQUEST:
    case CREATE_ANNOUNCEMENT_REQUEST:
    case UPDATE_ANNOUNCEMENT_REQUEST:
    case DELETE_ANNOUNCEMENT_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_ANNOUNCEMENTS_SUCCESS:
      return {
        ...state,
        announcements: action.payload,
        loading: false,
        error: null
      };

    case CREATE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        announcements: [action.payload, ...state.announcements],
        loading: false,
        error: null
      };

    case UPDATE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        announcements: state.announcements.map(a =>
          a._id === action.payload._id ? action.payload : a
        ),
        loading: false,
        error: null
      };

    case DELETE_ANNOUNCEMENT_SUCCESS:
      return {
        ...state,
        announcements: state.announcements.filter(a => a._id !== action.payload),
        loading: false,
        error: null
      };

    case FETCH_ANNOUNCEMENTS_ERROR:
    case CREATE_ANNOUNCEMENT_ERROR:
    case UPDATE_ANNOUNCEMENT_ERROR:
    case DELETE_ANNOUNCEMENT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
}
