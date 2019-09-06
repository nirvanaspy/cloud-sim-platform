import { axios } from '@/utils/request'

export function compAll(proId) {
    return axios({
        url: '/projects/' + proId + '/component',
        method: 'get',
        params: {
            deleted: false
        }
    })
}

export function createComp(proId, data) {
    return axios({
        url: '/projects/' + proId + '/component',
        method: 'post',
        headers: {
            // 'Content-Type': 'multipart/form-data'
            // 'content-type': 'application/json'
            'content-type': 'application/x-www-form-urlencoded'
        },
        data
    })
}
