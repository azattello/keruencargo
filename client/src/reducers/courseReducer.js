const FETCH_COURSES_REQUEST = 'FETCH_COURSES_REQUEST';
const FETCH_COURSES_SUCCESS = 'FETCH_COURSES_SUCCESS';
const FETCH_COURSES_ERROR = 'FETCH_COURSES_ERROR';

const defaultState = {
  courses: [],
  loading: false,
  error: null
};

export default function courseReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_COURSES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_COURSES_SUCCESS:
      return { ...state, loading: false, courses: action.payload, error: null };
    case FETCH_COURSES_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
