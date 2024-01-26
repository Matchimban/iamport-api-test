<template>
  <div class="container">
    
    <h3>결제 테스트용</h3>
    userId: <input type="text" v-model="userId"/><br>
    restaurantId: <input type="text" v-model="restaurantId"/><br>
    size(예약할 좌석의 크기): <input type="text" v-model="size"/><br> 
    regularPrice(원가): <input type="text" v-model="regularPrice"/> <br>
    paymentAmount(최종 결제가): <input type="text" v-model="paymentAmount" /> <br>
    startDate(yyyy-MM-dd hh:mm:ss): <input type="text" v-model="startDate" /> <br>
    endDate(yyyy-MM-dd hh:mm:ss): <input type="text" v-model="endDate" /> <br>
    buyer_tel(010-xxxx-xxxx): <input type="text" v-model="buyer_tel" /> <br>

    <br> menuList(주문할 메뉴들):
      <div v-for="(menu, index) in menuList" :key="`menu-${index}`">
        {{menu}}
      </div><br>
    <button @click="saveReservaiton">예약하기</button>
  </div>
</template>

<script>
import axios from "axios";
// import moment from 'moment/moment';
export default {
  name: 'ReservationComponent',
  components: {
  },
  data(){
    return {
      userId: 4,
      restaurantId: 2,
      size: 4,
      startDate: '2055-01-01 01:01:01',
      endDate: '2056-02-02 02:02:02',
      regularPrice: 0,
      paymentAmount: 0,
      menuList:[ 
        {menuId:1, menuName:"메뉴1", regularPrice: 500, paymentAmount: 500}, 
        {menuId:2, menuName:"메뉴2", regularPrice: 700, paymentAmount: 700}
      ], 
      buyer_tel:'010-1234-4321',
    };
  },
  created(){
    this.setAutoPrice();
  },
  // filters:{
  //   formatDate : function(value){
  //     if(!value) return "";
  //     return moment(new Date(value)).format("YYYY-MM-DD HH:mm:ss");
  //   }
  // },
  methods: {
    setAutoPrice(){
      for(let i=0; i<this.menuList.length; i++){
        this.regularPrice += this.menuList[i].regularPrice;
        this.paymentAmount += this.menuList[i].paymentAmount;
      }
    },
    saveReservaiton(){
      IMP.init(process.env.VUE_APP_IMP_INIT);
      IMP.request_pay({
        pg: process.env.VUE_APP_IMP_PG_NAME,
        name: "name test", //주문 명-> 매장 이름 및 메뉴들로 구성하기
        pay_method: "card", //결제 방식
        amount: this.paymentAmount, //결제 금액
        buyer_tel: this.buyer_tel //전화번호
      }, (rsp) => {
        if(rsp.success){
          let data = {
            impUid: rsp.imp_uid,
            userId: this.userId,
            restaurantId: this.restaurantId,
            size: this.size,
            startDate: this.startDate,
            endDate: this.endDate,
            regularPrice: this.regularPrice,
            paymentAmount: this.paymentAmount,
            menuList:this.menuList
          };
        axios.post('/api/reservations', data, 
          {headers: {
            Authorization: `BEARER ` + process.env.VUE_APP_TEMP_TOKEN
          }
          }).then( res => {
              console.log("DB 저장 성공", res);

            if(res.code == 63003) {
              console.log("iamport 결제 API 실패");
            } else if(res.code == 63004){
              console.log("검증 실패");
              this.canclePaymentsForFail(data);
            } 
          }).catch(e =>{
            console.log(e);
            console.log(e.response.data.code);
          })
        }else{
          console.log("iamport 결제 API 실패");
        }
      });
    },
    canclePaymentsForFail(data){ 
        axios.patch('/api/reservations/fail-and-refund', data, 
        {headers: {
            Authorization: `BEARER ` + process.env.VUE_APP_TEMP_TOKEN
        }
        }).then( res => {
          console.log("검증 실패 후 환불된 경우", res);
        }).catch(e => {
          console.log("검증 실패 후 환불 안된 경우", e);
        })
    }
  }
}
</script>

<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css';
</style>
