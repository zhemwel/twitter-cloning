import React, { Dispatch, MouseEvent, SetStateAction, useRef, useState } from 'react'
import {
  CalendarIcon,
  EmojiHappyIcon,
  LocationMarkerIcon,
  PhotographIcon,
  SearchCircleIcon,
} from '@heroicons/react/outline'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Tweet, TweetBody } from '../typings'
import { fetchTweets } from '../utils/fetchTweets'

interface Props {
  setTweets: Dispatch<SetStateAction<Tweet[]>>
}

function TweetBox({ setTweets }: Props) {
  const [input, setInput] = useState<string>("")
  const [image, setImage] = useState<string>("")

  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data: session } = useSession()
  const [imageOpen, setImageOpen] = useState<boolean>(false)

  const addImageToTweet = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.preventDefault()

    if (!imageInputRef.current?.value) return

    setImage(imageInputRef.current.value)
    imageInputRef.current.value = ""
    setImageOpen(false)
  }

  const postTweet = async () => {
    const tweetInfo: TweetBody = {
      text: input,
      username: session?.user?.name || "Unknown User",
      profileImg: session?.user?.image || "/user.jpg",
      image: image,
    }

    const result = await fetch(`/api/addTweet`, {
      body: JSON.stringify(tweetInfo),
      method: "POST",
    })

    const json = await result.json()

    const newTweets = await fetchTweets()
    setTweets(newTweets)

    toast.success("Tweet Posted")

    return json
  }

  const handleSubmit = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.preventDefault()

    postTweet()

    setInput("")
    setImage("")
    setImageOpen(false)
  }

  return (
    <div className="flex space-x-2 p-5">
      <img className="mt-4 h-14 w-14 rounded-full object-cover" src={session?.user?.image || "/user.jpg"} alt="" />

      <div className="flex flex-1 items-center pl-2">
        <form className="flex flex-1 flex-col" action="">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-24 w-full text-xl outline-none placeholder:text-xl"
            type="text"
            placeholder="What's Happening?"
          />

          <div className="flex items-center">
            {/* Icon */}
            <div className="flex space-x-2 text-twitter flex-1">
              <PhotographIcon onClick={(session) ? () => setImageOpen(!imageOpen) : () => toast.error("Login First!")} className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150" />
              <SearchCircleIcon className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150" />
              <EmojiHappyIcon className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150" />
              <CalendarIcon className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150" />
              <LocationMarkerIcon className="h-5 w-5 cursor-pointer transition-transform duration-150 ease-out hover:scale-150" />
            </div>

            <button
              disabled={!input || !session}
              onClick={handleSubmit}
              className="rounded-full bg-twitter px-5 py-2 font-bold text-white disabled:opacity-40"
            >Tweet</button>
          </div>
          {imageOpen && !image && (
            <div className="rounded-lg mt-5 flex bg-twitter/80 py-2 px-4">
              <input
                disabled={!session}
                ref={imageInputRef}
                className="flex-1 bg-transparent p-2 text-white outline-none placeholder:text-white"
                type="text"
                placeholder="Enter Image URL"
              />
              <button
                className="font-bold text-white"
                type="submit"
                onClick={addImageToTweet}
              > Add Image</button>
            </div>
          )}

          {image && (
            <img
              src={image}
              className="mt-10 h-40 w-full rounded-xl object-contain shadow-lg"
              alt=""
            />
          )}
        </form>
      </div>
    </div>
  )
}

export default TweetBox