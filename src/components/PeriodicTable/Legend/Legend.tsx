import { useContext, useState, PropsWithChildren } from "react";
import classNames from "classnames"
import Taro from "@tarojs/taro"
import { View, Slider, Image } from '@tarojs/components'
import ElementBox from "../../ElementBox"
import LineChart from "./LineChart"
import { zhCNCategories, Categories, elementsCategories } from "../../../data/classification"
import { formalShortAtomicWeights } from "../../../data/elements"
import { PeriodicTableContext } from "../reducer"
import { DisplayPropertiesModal } from "../../Modal"
import { propertiesLabels } from "../../../data/displayProperties"
import { getTrendData } from '../../../utils/trend'
import { reportEvent } from '../../../utils/analytics'
import { StorageKey } from "../../../types/storage"

import arrowImg from '../../../assets/icons/dropdown-arrow.svg'
import './legend.scss'

const emphasizeData = {
  'number': 1,
  'symbol': 2,
  'name': 3,
}

const colorSignData = {
  'trend': 1,
  'classification': 2,
  'block': 3,
  'state': 4,
}

type Props = PropsWithChildren<{
  themeClass?: string
}>

export default function Legend({ children, themeClass }: Props) {
  const { state: { emphasize, colorSign, temperature, displayProperty, trendData }, dispatch } = useContext(PeriodicTableContext)
  const [displayPropertiesModalVisible, setDisplayPropertiesModalVisible] = useState(false)

  const setTemperature = (value: number) => {
    const celsius = value - 273.15
    dispatch && dispatch({
      type: 'setTemperature',
      payload: {
        temperature: celsius
      }
    })
  }

  const setDisplayProperty = (type: typeof displayProperty) => {
    if (dispatch) {
      dispatch({
        type: 'setDisplayProperty',
        payload: { displayProperty: type }
      })

      // const trend = properties.some((item) => item.type === type && item.trend)
      let trend = getTrendData(type)
      // console.log('trendData', trendData)
      dispatch({
        type: 'setTrendData',
        payload: {
          trendData: trend
        }
      })
    }
    setDisplayPropertiesModalVisible(false)
    Taro.setStorageSync(StorageKey.displayProperty, type)
    reportEvent("properties", {
      "name": type,
      "page": 'index'
    })
  }

  const setColorSign = (type: typeof colorSign) => {
    dispatch && dispatch({
      type: 'setColorSign',
      payload: {
        colorSign: type
      }
    })
    reportEvent("color_sign", {
      "name": type
    })
  }

  const setEmphasize = (type: typeof emphasize) => {
    dispatch && dispatch({
      type: 'setEmphasize',
      payload: {
        emphasize: type
      }
    })
    
    reportEvent("emphasize", {
      "name": type
    })
  }

  return (
    <View className={classNames('pt__legend', themeClass)}>
      <View className='content'>
        <View className='legend-container'>
          {
            children ? children : (
              <ElementBox
                emphasize={emphasize}
                className={Categories[elementsCategories[1 - 1]]}
                atomicNumber={1}
                symbol='H'
                zhName='???'
                bc={formalShortAtomicWeights[1 - 1] + ""}
              />
            )
          }
          {
            emphasize === 'symbol' ? (
              <>
                <View className='label-1'>????????????</View>
                <View className='label-2'>????????????</View>
                <View className='label-3'>????????????</View>
              </>
            ) : emphasize === 'name' ? (
              <>
                <View className='label-1'>????????????</View>
                <View className='label-2'>????????????</View>
                <View className='label-3'>????????????</View>
              </>
            ) : (
              // number
              <>
                <View className='label-1'>????????????</View>
                <View className='label-2'>????????????</View>
                <View className='label-3'>????????????</View>
              </>
            )
          }
          <View
            className='label-4'
            onClick={() => setDisplayPropertiesModalVisible(true)}
          >
            {propertiesLabels[displayProperty]}
            <Image className='icon' src={arrowImg} />
          </View>
          <View className='switch-container'>
            <View
              className={classNames("switch", "i".repeat(emphasizeData[emphasize]))}
            >
              <View
                className='item'
                onClick={() => setEmphasize('number')}
              >??????</View>
              <View
                className='item'
                onClick={() => setEmphasize('symbol')}
              >??????</View>
              <View
                className='item'
                onClick={() => setEmphasize('name')}
              >??????</View>
            </View>
          </View>
        </View>
        <View className='color-sign-container'>
          {
            colorSign === 'trend' ? (
              <View className='trend-illustrate'>
                <View
                  className='title'
                  onClick={() => setDisplayPropertiesModalVisible(true)}
                >
                  {propertiesLabels[displayProperty]}
                  <Image className='icon' src={arrowImg} />
                </View>
                <View className='trend-scale'>
                  ???
                  <View className='gradient' />
                  ???
                </View>
                <LineChart
                  className='line-chart'
                  width={280 * 3}
                  height={120 * 3}
                  // data={formalShortAtomicWeigths}
                  // data={electronegativity}
                  data={trendData || []}
                />
              </View>
            ) :
              colorSign === 'classification' ? (
                <View className='classification-color'>
                  {
                    zhCNCategories.map((label, index) => (
                      <View
                        key={index}
                        className={classNames('item', Categories[index])}
                      >{label}</View>
                    ))
                  }
                </View>
              ) :
                colorSign === 'block' ? (
                  <View className='block-table'>
                    <View className='block s-block H' />
                    <View className='block s-block He' />
                    <View className='block s-block other'>s</View>
                    <View className='block d-block'>d</View>
                    <View className='block p-block'>p</View>
                    <View className='block f-block'>f</View>
                  </View>
                ) :
                  colorSign === 'state' ? (
                    <View className='state-panel'>
                      <View className='title'>??????</View>
                      <View className='label'>
                        <View className='item gas'>??????</View>
                        <View className='item liquid'>??????</View>
                        <View className='item solid'>??????</View>
                        <View className='item unknown'>??????</View>
                      </View>
                      <View className='title'>
                        ??????:{' '}
                        {temperature.toFixed(2)}??C  {(temperature + 273.15).toFixed(2)}K
                      </View>
                      <Slider
                        min={0}
                        max={6000}
                        step={1}
                        value={temperature + 273.15}
                        onChanging={(e) => setTemperature(e.detail.value)}
                        onChange={(e) => setTemperature(e.detail.value)}
                      />
                      <View className=''>
                        <View className='add' />

                        <View className='subtract' />
                      </View>
                    </View>
                  ) : ''
          }


          <View className={classNames('switch', 'i'.repeat(colorSignData[colorSign]))}>
            <View
              className='item'
              onClick={() => setColorSign('trend')}
            >??????</View>
            <View
              className='item'
              onClick={() => setColorSign('classification')}
            >??????</View>
            <View
              className='item'
              onClick={() => setColorSign('block')}
            >??????</View>
            <View
              className='item'
              onClick={() => setColorSign('state')}
            >??????</View>
          </View>
        </View>
      </View>

      <DisplayPropertiesModal
        themeClass={themeClass}
        visible={displayPropertiesModalVisible}
        setVisible={setDisplayPropertiesModalVisible}
        displayProperty={displayProperty}
        colorSign={colorSign}
        onSelect={setDisplayProperty}
      />
    </View>
  )
}
