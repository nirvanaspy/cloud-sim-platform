import { axios } from '@/utils/request'

export function getApplication() {
  return axios({
    url: '/applications',
    method: 'get'
  })
}

export function deleteApplication(id) {
  return axios({
    url: `/applications/${id}`,
    method: 'delete'
  })
}

export function addApplication(id, postData) {
  return axios({
    url: `/applications/byCreatorId`,
    method: 'post',
    headers: {
      creatorId: id,
      'content-type': 'application/json;charset=utf-8'
    },
    data: postData
  })
}

export function editApplication(id, postData) {
  return axios({
    url: `/applications/${id}`,
    method: 'patch',
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    data: postData
  })
}
