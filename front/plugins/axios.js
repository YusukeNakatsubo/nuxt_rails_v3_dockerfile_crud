export default ({ $axios }) => {
  // Request log
  $axios.onRequest((config) => {
    console.log(config)
  })
  // Response log
  $axios.onResponse((config) => {
    console.log(config)
  })
  // Error log
  $axios.onError((e) => {
    console.log(e.response)
  })
}
