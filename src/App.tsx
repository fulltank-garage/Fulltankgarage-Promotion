import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import fulltankGarageLogo from './assets/fulltank-garage-logo.jpg'
import { getJson } from './lib/api'

type Promotion = {
  title: string
  description: string
  detail: string
  imageUrl?: string
  validUntil: string
  gradient: string
}

const promotionHashPrefix = '#promotion/'

const getPromotionKey = (title: string) =>
  encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, '-'))

const getPromotionKeyFromHash = () => {
  if (!window.location.hash.startsWith(promotionHashPrefix)) {
    return ''
  }

  return window.location.hash.slice(promotionHashPrefix.length)
}

const promotions: Promotion[] = [
  {
    title: 'ติดฟิล์มรอบคัน ราคาพิเศษ',
    description: 'เลือกรุ่นฟิล์มยอดนิยมพร้อมรับส่วนลดค่าแรงติดตั้งสำหรับรถเก๋งและ SUV',
    detail: 'โปรโมชันสำหรับลูกค้าที่ติดตั้งฟิล์มรอบคันกับ FullTank Garage สามารถสอบถามรุ่นฟิล์ม เงื่อนไขส่วนลด และคิวติดตั้งได้ที่หน้าร้านหรือ LINE Official',
    validUntil: '31 พ.ค. 2569',
    gradient: 'from-[#ff342f] via-[#6f0908] to-[#121212]',
  },
  {
    title: 'อัปเกรดบานหน้า Clear Vision',
    description: 'เพิ่มความสบายตาด้วยฟิล์มใสกันร้อนสำหรับลูกค้าที่ติดตั้งรอบคัน',
    detail: 'เหมาะสำหรับลูกค้าที่ต้องการเพิ่มประสิทธิภาพกันร้อนบริเวณบานหน้า โดยยังคงทัศนวิสัยชัดเจน รายละเอียดขึ้นอยู่กับรุ่นฟิล์มและรถแต่ละคัน',
    validUntil: '15 มิ.ย. 2569',
    gradient: 'from-[#ff4a45] via-[#243247] to-[#101010]',
  },
  {
    title: 'ลูกค้าเก่าแนะนำเพื่อน',
    description: 'รับสิทธิ์ส่วนลดบริการดูแลฟิล์ม เมื่อเพื่อนลงทะเบียนรับประกันสำเร็จ',
    detail: 'เมื่อลูกค้าเก่าแนะนำเพื่อนมาติดตั้งและลงทะเบียนรับประกันสำเร็จ สามารถติดต่อทีมงานเพื่อรับสิทธิ์ส่วนลดบริการดูแลฟิล์มตามเงื่อนไขที่ร้านกำหนด',
    validUntil: '30 มิ.ย. 2569',
    gradient: 'from-[#ff2f2b] via-[#3b0404] to-[#070707]',
  },
]

function App() {
  const [items, setItems] = useState<Promotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)
  const [selectedPromotionKey, setSelectedPromotionKey] = useState(getPromotionKeyFromHash)
  const selectedPromotion = useMemo(
    () =>
      selectedPromotionKey
        ? items.find((promotion) => getPromotionKey(promotion.title) === selectedPromotionKey) ||
          promotions.find((promotion) => getPromotionKey(promotion.title) === selectedPromotionKey) ||
          null
        : null,
    [items, selectedPromotionKey],
  )
  const isDetailView = Boolean(selectedPromotionKey)

  useEffect(() => {
    let isMounted = true

    getJson<
      {
        title: string
        description?: string
        detail?: string
        imageUrl?: string
        endsAt?: string
      }[]
    >('/public/promotions?public=true')
      .then((promotionsFromApi) => {
        if (!isMounted) {
          return
        }

        setItems(
          promotionsFromApi.length > 0
            ? promotionsFromApi.map((promotion, index) => ({
                title: promotion.title,
                description: promotion.description || 'โปรโมชันจาก FullTank Garage',
                detail: promotion.detail || promotion.description || 'สอบถามรายละเอียดเพิ่มเติมได้ที่ FullTank Garage',
                imageUrl: promotion.imageUrl,
                validUntil: formatThaiDate(promotion.endsAt) || 'สอบถามหน้าร้าน',
                gradient: promotions[index % promotions.length].gradient,
              }))
            : promotions,
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

  useEffect(() => {
    const handleHashChange = () => {
      setSelectedPromotionKey(getPromotionKeyFromHash())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const openPromotion = (promotion: Promotion) => {
    const nextHash = `${promotionHashPrefix}${getPromotionKey(promotion.title)}`
    if (window.location.hash === nextHash) {
      setSelectedPromotionKey(getPromotionKey(promotion.title))
    } else {
      history.pushState('', document.title, nextHash)
      setSelectedPromotionKey(getPromotionKey(promotion.title))
    }
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const closePromotion = () => {
    history.pushState('', document.title, window.location.pathname + window.location.search)
    setSelectedPromotionKey('')
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
  }

  return (
    <main className="min-h-dvh bg-[#070707] px-4 pb-5 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/10 bg-[#070707]/94 px-4 py-3 backdrop-blur">
          <div className="relative mx-auto flex min-h-11 w-full max-w-2xl items-center justify-center">
            {isDetailView ? (
              <button
                aria-label="กลับไปหน้าโปรโมชัน"
                className="absolute left-0 grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition active:scale-95"
                onClick={closePromotion}
                type="button"
              >
                <ChevronLeft size={28} strokeWidth={2.6} />
              </button>
            ) : null}
            <div className="flex min-w-0 items-center justify-center gap-3 px-12">
              <img
                alt="FullTank Garage"
                className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-[0_10px_24px_rgba(255,64,59,0.18)]"
                src={fulltankGarageLogo}
              />
              <h1 className="min-w-0 truncate text-center text-[22px] font-black leading-none text-white">
                โปรโมชันล่าสุด
              </h1>
            </div>
          </div>
        </nav>

        {selectedPromotion ? (
          <PromotionDetail promotion={selectedPromotion} />
        ) : isDetailView ? (
          <PromotionDetailSkeleton />
        ) : (
          <section className="space-y-4">
            {isLoadingPromotions ? <PromotionListSkeleton /> : null}
            {items.map((promotion) => (
              <PromotionCard
                key={promotion.title}
                onOpen={() => openPromotion(promotion)}
                promotion={promotion}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

function PromotionDetailSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]"
    >
      <div className="promotion-square-media relative skeleton-shimmer" />
      <div className="p-5">
        <div className="h-8 w-4/5 rounded-xl skeleton-shimmer" />
        <div className="mt-4 h-12 w-full rounded-2xl skeleton-shimmer" />
        <div className="mt-5 h-5 w-full rounded-xl skeleton-shimmer" />
        <div className="mt-3 h-5 w-5/6 rounded-xl skeleton-shimmer" />
        <div className="mt-5 rounded-2xl border border-[#ff403b]/22 bg-[#ff403b]/8 p-4">
          <div className="h-4 w-36 rounded-xl skeleton-shimmer" />
          <div className="mt-3 h-4 w-full rounded-xl skeleton-shimmer" />
          <div className="mt-2 h-4 w-2/3 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </article>
  )
}

function PromotionCard({
  onOpen,
  promotion,
}: {
  onOpen: () => void
  promotion: Promotion
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]">
      <button className="block w-full text-left" onClick={onOpen} type="button">
        <PromotionMedia promotion={promotion} />

        <div className="p-4">
          <h2 className="text-xl font-black">{promotion.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
            {promotion.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white/62">
              <CalendarDays size={17} />
              ถึง {promotion.validUntil}
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-[#ff6965]">
              อ่านรายละเอียด
              <ChevronRight className="text-[#ff403b]" size={20} />
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}

function PromotionDetail({
  promotion,
}: {
  promotion: Promotion
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]">
      <PromotionMedia promotion={promotion} />

      <div className="p-5">
        <h2 className="text-2xl font-black leading-tight text-white">
          {promotion.title}
        </h2>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm font-black text-white/68">
          <CalendarDays className="text-[#ff403b]" size={18} />
          ใช้ได้ถึง {promotion.validUntil}
        </div>
        <p className="mt-5 text-base font-semibold leading-8 text-white/70">
          {promotion.description}
        </p>
        <div className="mt-5 rounded-2xl border border-[#ff403b]/22 bg-[#ff403b]/8 p-4">
          <h3 className="text-sm font-black text-white">
            รายละเอียดโปรโมชัน
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
            {promotion.detail}
          </p>
        </div>
      </div>
    </article>
  )
}

function PromotionMedia({ promotion }: { promotion: Promotion }) {
  return (
    <div className={`promotion-square-media relative bg-gradient-to-br ${promotion.gradient}`}>
      {promotion.imageUrl ? (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={promotion.imageUrl}
        />
      ) : null}
    </div>
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
          <div className="promotion-square-media relative skeleton-shimmer" />
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
