const SET_USER = "SET_USER";    
const LOGOUT = "LOGOUT";    

const defaultState = {
    currentUser: {},
    isAuth: false
}

export default function userReducer(state = defaultState, action){
    switch (action.type) {
        case SET_USER:
            return{
                ...state,
                currentUser: action.payload,
                isAuth: !!action.payload  // true если есть пользователь, false если null
            }
        case LOGOUT:
            localStorage.removeItem('token')
            localStorage.removeItem('isAdmin')
            localStorage.removeItem('role')
            
            return{
                ...state,
                currentUser: null,
                isAuth: false
            }
        default:
            return state
    }
}


export const setUser = user => ({type: SET_USER, payload: user})
export const logout = () => ({type: LOGOUT})