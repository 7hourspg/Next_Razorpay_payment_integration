'use client'

import React from 'react'
import Script from 'next/script'
import axios from 'axios'
import { useRouter } from 'next/navigation'

function page () {
  const [isLoading, setIsLoading] = React.useState(false)

  const router = useRouter()

  const makePayment = async e => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Making payment')
    try {
      const response = await axios.post('/api', {
        amount: 1000
      })

      const data = response.data

      let options = {
        key: `${process.env.NEXT_PUBLIC_RAZORPAY_ID}`,
        amount: data.amount,
        currency: 'INR',
        name: 'Example Corp.',
        image:
          'https://img.freepik.com/premium-vector/charity-abstract-logo-healthy-lifestyle_660762-34.jpg?size=626&ext=jpg',
        description: 'Test Transaction',
        order_id: data.orderId,
        'theme.color': '#FF6C22',
        handler: async response => {
          try {
            await axios.post('/api/success', {
              amount: data.amount,
              currency: data.currency,
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
            router.push('/success')
          } catch (error) {
            console.log(error)
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()

      paymentObject.on('payment.failed', function (response) {
        console.log(response.error.code)
        console.log(response.error.description)
        console.log(response.error.source)
      })

      paymentObject.on('payment.success', function (response) {
        console.log(response)
      })
    } catch (error) {
      console.error('Error fetching Order ID:', error)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Script
        id='razorpay-checkout-js'
        src='https://checkout.razorpay.com/v1/checkout.js'
      />
      <div className='flex flex-col items-center justify-center min-h-screen py-2'>
        <h1>Donation Form </h1>

        <form className='flex flex-col'>
          <label htmlFor='name'>Name</label>
          <input
            id='name'
            type='text'
            className='mb-4 outline-none border-sky-100 border-2'
          />

          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            className='mb-4 outline-none border-sky-100 border-2'
          />

          <label htmlFor='amount'>Amount</label>
          <input
            id='amount'
            type='number'
            className='mb-4 outline-none border-sky-100 border-2'
          />

          <label htmlFor='currency'>Currency</label>
          <select
            id='currency'
            className='mb-4 outline-none border-sky-100 border-2'
          >
            <option value='INR'>INR</option>
            <option value='USD'>USD</option>
            <option value='EUR'>EUR</option>
            <option value='GBP'>GBP</option>
          </select>

          <button
            type='submit'
            onClick={makePayment}
            className='bg-blue-500 text-white px-4 py-2'
          >
            {isLoading ? 'Loading...' : 'Donate'}
          </button>
        </form>
      </div>
    </>
  )
}

export default page
