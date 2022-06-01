import React, { useCallback, useContext, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'

import { ConnectContext } from '../../../store/connector'
import CreatePool from '../../atoms/createPool/createPool'
import Pools from '../pools/pools'
import PopUp from '../popUp/popUp'
import { database } from '../../../firebaseConfig'

export interface ItemPool {
  appAddress: string
  appId: number
  title: string
  description: string
  dateStart: number
  dateEnd: number
  dateClose: number
  goal: number
  current: number
  id: string
}

const FundingsHero = () => {
  const [create, setCreate] = useState<boolean>(false)
  const dbInstance = collection(database, 'active-pools')
  const [poolsArray, setPoolsArray] = useState<Array<ItemPool>>([])
  const [pastArray, setPastArray] = useState<Array<ItemPool>>([])
  const [futureArray, setFutureArray] = useState<Array<ItemPool>>([])
  const [activeArray, setActiveArray] = useState<Array<ItemPool>>([])
  const [result, setResult] = useState<boolean>(true)
  const [popUp, setPopUp] = useState<boolean>(false)

  const connector = useContext(ConnectContext)

  const [state, setState] = useState<string>('Fetching from database')

  const getPools = useCallback(() => {
    console.log('Data fetched')
    getDocs(dbInstance)
      .then((data) => {
        setPoolsArray(
          data.docs.map((item) => {
            const itemData = item.data()
            return {
              title: itemData.title,
              description: itemData.description,
              dateStart: itemData.dateStart,
              dateEnd: itemData.dateEnd,
              dateClose: itemData.dateClose,
              goal: itemData.goal,
              current: itemData.current,
              id: item.id,
              appAddress: itemData.appAddress,
              appId: itemData.appId,
            }
          })
        )
        setResult(true)
      })
      .catch((error) => {
        console.log(error)
        setResult(false)
      })
      .finally(() => {
        setState('There are no pools')
      })
  }, [dbInstance])

  useEffect(() => {
    getPools()
  }, [])

  useEffect(() => {
    setActiveArray(
      poolsArray.filter(
        (item) =>
          isAvaiable(item.dateStart, item.dateEnd) == 0 ||
          isAvaiable(item.dateStart, item.dateClose) == 0
      )
    )
    setPastArray(
      poolsArray.filter(
        (item) => isAvaiable(item.dateStart, item.dateEnd) == -1
      )
    )
    setFutureArray(
      poolsArray.filter((item) => isAvaiable(item.dateStart, item.dateEnd) == 1)
    )
  }, [poolsArray])

  const isAvaiable = (dateStart: number, dateEnd: number) => {
    const x = new Date()
    const start = new Date(dateStart)
    const end = new Date(dateEnd)
    if (x >= start && x < end) {
      return 0
    }
    if (x < start && x < end) return 1
    if (x >= end && x > start) return -1
    return null
  }

  const handleCreateClick = () => {
    if (connector.connected) setCreate(true)
    else setPopUp(true)
  }

  const classH2 = 'text-smallH2 md:text-bigH2 mt-8 ml-8'

  return (
    <div className="flex flex-col justify-center align-middle">
      <div className="z-10 my-40 flex flex-row justify-center text-left align-middle">
        <h1 className=" mx-8 text-center font-mont text-smallH1 tracking-wider text-brown md:flex-row md:text-bigH1">
          Explore or{' '}
          <span
            className=" cursor-pointer leading-3 underline decoration-solid decoration-2 underline-offset-8 transition-[text-decoration-thickness] hover:decoration-4"
            onClick={handleCreateClick}
          >
            create
          </span>{' '}
          fundings
        </h1>
      </div>
      {result ? (
        poolsArray.length > 0 ? (
          <div className=" mx-auto flex w-[95%] flex-col">
            <h2 className={classH2}>Active fundings</h2>
            <Pools
              poolsArray={activeArray}
              type={'active'}
              showPopUp={() => {
                setPopUp(true)
              }}
            />
            <h2 className={classH2}>Future fundings</h2>
            <Pools
              poolsArray={futureArray}
              type={'future'}
              showPopUp={() => {
                setPopUp(true)
              }}
            />
            <div className="opacity-70">
              <h2 className={classH2}>Past fundings</h2>
              <Pools
                poolsArray={pastArray}
                type={'past'}
                showPopUp={() => {
                  setPopUp(true)
                }}
              />
            </div>
          </div>
        ) : (
          <p className="mx-auto mb-16 w-fit rounded-2xl border-2 border-brown px-8 py-4 text-center text-lg shadow-2xl">
            {state}
          </p>
        )
      ) : (
        <p className="mx-auto mb-16 w-fit rounded-2xl border-2 border-brown px-8 py-4 text-center shadow-2xl">
          Error fetching from database
        </p>
      )}
      <button
        className=" z-10 mx-auto mt-20 flex w-fit flex-col rounded-2xl bg-brown px-8 py-px text-smallA text-purple transition-transform hover:scale-105 md:text-bigA"
        onClick={handleCreateClick}
      >
        <h2 className="text-smallH2 md:text-bigH2">Create funding</h2>
      </button>
      <div
        style={
          create
            ? {
                opacity: 1,
                zIndex: 100,
              }
            : { opacity: 0, zIndex: -100 }
        }
        className="transition-[z-index_opacity] duration-300"
      >
        <CreatePool
          dbInstance={dbInstance}
          getPools={getPools}
          setCreate={setCreate}
        />
      </div>
      {popUp ? (
        <PopUp>
          <p>You have to connect a wallet first</p>
          <button
            className="transition-scale mx-4 mt-8 w-fit rounded-2xl bg-brown px-4 py-px text-center text-purple duration-100 hover:scale-105"
            onClick={() => setPopUp(false)}
          >
            Ok
          </button>
        </PopUp>
      ) : (
        <></>
      )}
    </div>
  )
}

export default FundingsHero
