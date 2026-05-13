import { CalendarDays, ChevronRight, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import fulltankGarageLogo from './assets/fulltank-garage-logo.jpg'
import { getJson } from './lib/api'

type Promotion = {
  title: string
  description: string
  imageUrl?: string
  validUntil: string
  gradient: string
  imageText: string
}

const promotions: Promotion[] = [
  {
    title: 'ติดฟิล์มรอบคัน ราคาพิเศษ',
    description: 'เลือกรุ่นฟิล์มยอดนิยมพร้อมรับส่วนลดค่าแรงติดตั้งสำหรับรถเก๋งและ SUV',
    validUntil: '31 พ.ค. 2569',
    gradient: 'from-[#ff342f] via-[#6f0908] to-[#121212]',
    imageText: 'FULL SET',
  },
  {
    title: 'อัปเกรดบานหน้า Clear Vision',
    description: 'เพิ่มความสบายตาด้วยฟิล์มใสกันร้อนสำหรับลูกค้าที่ติดตั้งรอบคัน',
    validUntil: '15 มิ.ย. 2569',
    gradient: 'from-[#ff4a45] via-[#243247] to-[#101010]',
    imageText: 'FRONT',
  },
  {
    title: 'ลูกค้าเก่าแนะนำเพื่อน',
    description: 'รับสิทธิ์ส่วนลดบริการดูแลฟิล์ม เมื่อเพื่อนลงทะเบียนรับประกันสำเร็จ',
    validUntil: '30 มิ.ย. 2569',
    gradient: 'from-[#ff2f2b] via-[#3b0404] to-[#070707]',
    imageText: 'REFER',
  },
]

function App() {
  const [items, setItems] = useState<Promotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)

  useEffect(() => {
    let isMounted = true

    getJson<
      {
        title: string
        description?: string
        imageUrl?: string
        endsAt?: string
      }[]
    >('/public/promotions?public=true')
      .then((promotionsFromApi) => {
        if (!isMounted || promotionsFromApi.length === 0) {
          return
        }

        setItems(
          promotionsFromApi.map((promotion, index) => ({
            title: promotion.title,
            description: promotion.description || 'โปรโมชันจาก FullTank Garage',
            imageUrl: promotion.imageUrl,
            validUntil: formatThaiDate(promotion.endsAt) || 'สอบถามหน้าร้าน',
            gradient: promotions[index % promotions.length].gradient,
            imageText: promotion.title.split(/\s+/).slice(0, 2).join(' ').toUpperCase(),
          })),
        )
      })
      .catch(() => {
        if (isMounted) {
          setItems(promotions)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPromotions(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-[#070707] px-4 pb-5 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/10 bg-[#070707]/94 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3">
            <img
              alt="FullTank Garage"
              className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-[0_10px_24px_rgba(255,64,59,0.18)]"
              src={fulltankGarageLogo}
            />
            <h1 className="min-w-0 text-center text-[22px] font-black leading-none text-white">
              โปรโมชันล่าสุด
            </h1>
          </div>
        </nav>

        <section className="space-y-4">
          {isLoadingPromotions ? <PromotionListSkeleton /> : null}
          {items.map((promotion) => (
            <article
              className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]"
              key={promotion.title}
            >
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${promotion.gradient}`}>
                {promotion.imageUrl ? (
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    src={promotion.imageUrl}
                  />
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(135deg,transparent,rgba(0,0,0,0.58))]" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="break-words text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {promotion.imageText}
                  </p>
                  <img
                    alt="FullTank Garage"
                    className="mt-3 h-auto w-40 rounded-lg object-cover opacity-90"
                    src={fulltankGarageLogo}
                  />
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ff403b]/12 px-3 py-1 text-xs font-black text-[#ff6965]">
                  <Tag size={14} />
                  โปรโมชัน
                </div>
                <h2 className="text-xl font-black">{promotion.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
                  {promotion.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white/62">
                    <CalendarDays size={17} />
                    ถึง {promotion.validUntil}
                  </div>
                  <ChevronRight className="text-[#ff403b]" size={20} />
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

function PromotionListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <article
          aria-hidden="true"
          className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]"
          key={index}
        >
          <div className="relative aspect-[16/9] skeleton-shimmer">
            <div className="absolute bottom-5 left-5 h-10 w-44 rounded-xl bg-black/20" />
            <div className="absolute bottom-5 left-5 mt-3 h-8 w-36 translate-y-12 rounded-lg bg-black/20" />
          </div>
          <div className="p-4">
            <div className="h-6 w-24 rounded-full skeleton-shimmer" />
            <div className="mt-4 h-6 w-4/5 rounded-xl skeleton-shimmer" />
            <div className="mt-3 h-4 w-full rounded-xl skeleton-shimmer" />
            <div className="mt-2 h-4 w-2/3 rounded-xl skeleton-shimmer" />
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <div className="h-5 w-36 rounded-xl skeleton-shimmer" />
              <div className="size-5 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </article>
      ))}
    </>
  )
}

const formatThaiDate = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default App
