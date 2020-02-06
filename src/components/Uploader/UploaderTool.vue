<template>
  <uploader
    ref="uploader"
    :options="options"
    class="uploader-example"
    @files-added="onFilesAdd"
    @file-success="onFileSuccess"
  >
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <p>Drop files here to upload or</p>
      <uploader-btn>select files</uploader-btn>
      <uploader-btn :attrs="attrs">select images</uploader-btn>
      <uploader-btn :directory="true">select folder</uploader-btn>
    </uploader-drop>
    <uploader-list></uploader-list>
  </uploader>
</template>

<script>
import SparkMD5 from 'spark-md5'
import Vue from 'vue'
import qs from 'qs'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { hasMd5, mergeFile } from '@/api/files'
import uniqid from 'uniqid'

export default {
  name: 'UploaderTool',
  data() {
    return {
      // 文件上传配置项
      options: {
        target: 'http://127.0.0.1:8080/apis/files/chunks',
        headers: {
          Authorization: `bearer${Vue.ls.get(ACCESS_TOKEN)}`
        },
        chunkSize: 10 * 1024 * 1024,
        simultaneousUploads: 20,
        autoStart: false,
        testChunks: true
        // checkChunkUploadedByResponse: function(chunk, message) {
        //   let objMessage = JSON.parse(message)
        //   if (objMessage.skipUpload) {
        //     return true
        //   }
        //   return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
        // }
      },
      attrs: {
        accept: 'image/*'
      },
      promiseList: []
    }
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader
    }
  },
  methods: {
    // 文件信息实例化工厂
    fileInfoFactory(fileObj) {
      let fileInfo = new Object()
      fileInfo.identifier = fileObj.uniqueIdentifier
      fileInfo.relativePath = '/' + fileObj.relativePath
      fileInfo.totalSize = fileObj.totalSize
      fileInfo.filename = fileObj.name
      fileInfo.totalChunks = fileObj.chunks.length
      fileInfo.status = ''
      return fileInfo
    },

    // mergeFileFactory
    mergeFileFactory(fileInfo) {
      let P = new Promise((resolve, reject) => {
        mergeFile(qs.stringify(fileInfo))
          .then(res => {
            resolve(res.data.data.id)
          })
          .catch(() => {
            reject('error')
          })
      })
      return P
    },

    // 按添加文件的批次赋予每批文件唯一的serialNo
    serialInfoFactory(id, num) {},

    // 文件添加后的回调
    /*onFileAdd(file) {
      this.computeMD5(file)
    },*/

    //批量添加文件
    onFilesAdd(files) {
      // let tag = uniqid.time()
      // files.forEach(file => {
      //   file.serialNo = tag
      // })
      files.forEach(file => {
        this.computeMD5(file)
      })
    },

    // 计算文件MD5的方法
    computeMD5(file) {
      console.log(1)
      let fileReader = new FileReader()
      let time = new Date().getTime()
      let blobSlice = File.prototype.slice
      let currentChunk = 0
      const chunkSize = 10 * 1024 * 1000
      let chunks = Math.ceil(file.size / chunkSize)
      let spark = new SparkMD5.ArrayBuffer()
      file.pause()
      loadNext()
      fileReader.onload = e => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            document.getElementsByClassName(`.myStatus_${file.id}`).text =
              '校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
          })
        } else {
          let md5 = spark.end()
          this.computeMD5Success(md5, file)
          console.log(
            `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
              file.size
            } 用时：${new Date().getTime() - time} ms`
          )
        }
      }
      fileReader.onerror = function() {
        this.$message.error(`文件${file.name}读取出错，请检查该文件`)
        file.cancel()
      }
      function loadNext() {
        let start = currentChunk * chunkSize
        let end = start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },

    // 计算MD5成功后的回调
    computeMD5Success(md5, file) {
      alert(md5)
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploader.opts, {
        query: {
          ...this.params
        }
      })
      file.uniqueIdentifier = md5
      let fileInfo = this.fileInfoFactory(file)
      console.log(fileInfo)
      hasMd5(md5).then(res => {
        // 如果文件md5已存在则应该直接upload
        if (res.data.data.id) {
        } else {
          // 文件md5不存在则继续上传
          file.resume()
        }
      })
    },

    // 文件上传成功后的回调
    onFileSuccess() {
      console.log(arguments[1])
      let fileInfo = this.fileInfoFactory(arguments[1])
      this.promiseList.push(this.mergeFileFactory(fileInfo))
    }
  },
  watch: {
    promiseList: function(val) {
      Promise.all(val).then(() => {
        console.log(val)
        alert('all promises success')
      })
    }
  }
}
</script>

<style>
.uploader-example {
  width: 880px;
  padding: 15px;
  margin: 40px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
