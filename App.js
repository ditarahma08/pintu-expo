import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, ScrollView, Image, SafeAreaView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { priceResponse } from './utils/response'
import axios from 'axios'

export default function App() {
    const [currencies, setCurrencies] = useState([])
    const [fetchedCurrencies, setFetchedCurrencies] = useState(false)
    const [fetchedPrice, setFetchedPrice] = useState(false)

    const formatMoney = (amount, decimalCount = 0, decimal = ',', thousands = '.') => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 0 : decimalCount;

      const negativeSign = amount < 0 ? '-' : '';

      let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString();

      let j = i.length > 3 ? i.length % 3 : 0;

      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : '')
      );
    } catch (e) {
      console.log(e);
    }
  }

    const assignPrices = (prices) => {
      let newCurrencies = currencies

      prices.map((price) => {
        const currency = price.pair.split('/')[0]
        const objIndex = currencies.findIndex((item) => { return item.currencyGroup.toLowerCase() == currency.toLowerCase() })

        newCurrencies[objIndex] = {...newCurrencies[objIndex], prices: price}
        newCurrencies.length > 0 && setCurrencies(newCurrencies)
      })
    }

    const fetchCurrencies = async () => {
      await axios.get('https://api.pintu.co.id/v2/wallet/supportedCurrencies')
        .then((response) => {
          let newData = []
          response?.data?.payload.map((data) => newData.push(data))
          setCurrencies(newData)
          console.log(response.data)
          setFetchedCurrencies(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const fetchPrice = async () => {
      await axios.get('https://api.pintu.co.id/v2/trade/price-changes')
        .then((response) => {
          assignPrices(response?.data?.payload.length > 0 ? response?.data?.payload : priceResponse?.payload)
          setFetchedPrice(true)
        })
        .catch((error) => {
          assignPrices(priceResponse?.payload)
          setFetchedPrice(true)
        })
    }

    useEffect(() => {
      !fetchedCurrencies && fetchCurrencies()
    }, [])

    useEffect(() => {
      !fetchedPrice && fetchPrice()
      console.log(currencies)
    }, [currencies])

  return (
    <SafeAreaView>
      <ScrollView>
        {currencies.map((currency, index) => (
          <View key={index}>
            <Image style={styles.currencyLogo} source={{uri: currency?.logo}} resizeMode={'cover'} />

            <View style={styles.listBox}>
              <View>
                <Text style={styles.listTitle}>{currency?.name}</Text>
                <Text>{currency?.currencyGroup?.toUpperCase()}</Text>
              </View>

              <View>
                <Text style={styles.priceRupiah}>Rp{formatMoney(currency?.prices?.latestPrice)}</Text>
                <Text style={currency?.prices?.day < 0 ? styles.textNegative : styles.textPositive}>{currency?.prices?.day}</Text>
              </View>
            </View>
          </View>
        ))}

        <Text>lalala</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  currencyLogo: {
    height: 20,
    width: 20
  },
  listBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 7,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  priceRupiah: {
    fontWeight: 'bold'
  },
  textNegative: {
    color: 'red'
  },
  textPositive: {
    color: 'green'
  }
});
