'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    rotation: number
    rotationSpeed: number
    color: string
    w: number
    h: number
}

const COLORS = ['#c36a3a', '#e8935a', '#f4c89a', '#fffbf2', '#ffd166', '#d4956a', '#a0522d']

interface ConfettiProps {
    active: boolean
    fading: boolean
}

export default function Confetti({ active, fading }: ConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const rafRef = useRef<number>(0)
    const fadingRef = useRef(false)
    const globalOpRef = useRef(1)
    const spawnedRef = useRef(false)

    useEffect(() => {
        fadingRef.current = fading
    }, [fading])

    useEffect(() => {
        if (!active) return
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        if (!spawnedRef.current) {
            spawnedRef.current = true
            for (let i = 0; i < 160; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: -10 - Math.random() * 80,
                    vx: (Math.random() - 0.5) * 9,
                    vy: Math.random() * 4 + 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 12,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    w: Math.random() * 10 + 4,
                    h: Math.random() * 5 + 2,
                })
            }
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (fadingRef.current) {
                globalOpRef.current = Math.max(0, globalOpRef.current - 0.025)
            }

            particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 40)

            for (const p of particlesRef.current) {
                p.vy += 0.14
                p.x += p.vx
                p.y += p.vy
                p.vx *= 0.995
                p.rotation += p.rotationSpeed

                ctx.save()
                ctx.globalAlpha = globalOpRef.current
                ctx.translate(p.x, p.y)
                ctx.rotate((p.rotation * Math.PI) / 180)
                ctx.fillStyle = p.color
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
                ctx.restore()
            }

            if (globalOpRef.current > 0 && particlesRef.current.length > 0) {
                rafRef.current = requestAnimationFrame(tick)
            }
        }

        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [active])

    if (!active) return null

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                width: '100vw',
                height: '100vh',
            }}
        />
    )
}
