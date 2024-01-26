import { createApp, h} from 'vue'
import HomeComponent from './components/Home'
import ErrorComponent from './components/Error'
import ReservationComponent from './components/Reservation'

const routes = {
  '/' : HomeComponent,
  '/error': ErrorComponent,
  '/reservation' : ReservationComponent
}

const SimpleRouter = {
  data: () => ({
    currentRoute: window.location.pathname
  }),
  computed: {
    CurrentComponent(){
      return routes[this.currentRoute] || ErrorComponent
    }
  },
  render(){
    return h(this.CurrentComponent)
  }
}

createApp(SimpleRouter).mount('#app')