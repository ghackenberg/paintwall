import { UserObject } from "paintwall-common"

interface UserData {
    mailToken: { tokenId: string, email: string }
    jwtToken: string
    userId: string
    userObject: UserObject
}

export const USER_DATA: UserData = {
    mailToken: null,
    jwtToken: localStorage.getItem('jwtToken'),
    userId: localStorage.getItem('userId'),
    userObject: JSON.parse(localStorage.getItem('userObject') || 'null')
}