import { UserObject } from "paintwall-common"

interface UserData {
    code: { codeId: string, email: string }
    token: string
    user: UserObject
}

export const USER_DATA: UserData = {
    code: null,
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
}