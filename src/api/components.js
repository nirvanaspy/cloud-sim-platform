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
      'content-type': 'application/x-www-form-urlencoded'
    },
    data
  })
}
