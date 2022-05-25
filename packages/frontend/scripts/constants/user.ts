import { UserObject } from "paintwall-common"

interface UserData {
    skip: boolean
    code: { codeId: string, email: string }
    token: string
    user: UserObject
}

export const USER_DATA: UserData = {
    skip: true,
    code: null,
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
}