'use client';

import { useState, useEffect } from 'react'

import type { Post, Settings } from 'lib/sanity.queries'
import { getAllPosts } from 'lib/sanity.client'

export default async function GetHomeData() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        const newPosts: any = getAllPosts();
        setPosts(newPosts)
    }, [])

    return posts
}