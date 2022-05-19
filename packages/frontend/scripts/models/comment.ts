import { CommentObject } from 'paintwall-common'

export class CommentModel implements CommentObject {

    commentId: string
    parentId: string | undefined
    clientId: string
    content: string

    constructor(commentId: string, parentId: string | undefined, clientId: string, content: string) {
        this.commentId = commentId
        this.parentId = parentId
        this.clientId = clientId
        this.content = content
    }

}