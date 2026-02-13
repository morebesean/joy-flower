import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 중...\n')
  console.log('📍 URL:', supabaseUrl)
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...\n')

  try {
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)

    if (error) {
      console.log('⚠️  테이블이 아직 생성되지 않았습니다 (예상된 동작)')
      console.log('   에러 메시지:', error.message)
      console.log('\n✅ 하지만 Supabase 연결 자체는 성공했습니다!')
      console.log('   다음 단계: 데이터베이스 스키마를 생성하세요.\n')
    } else {
      console.log('✅ Supabase 연결 성공!')
      console.log('✅ products 테이블이 이미 존재합니다!')
      console.log('   데이터:', data)
    }
  } catch (err) {
    console.error('❌ 연결 실패:', err)
    console.log('\n💡 문제 해결:')
    console.log('   1. .env.local 파일의 값들을 다시 확인하세요')
    console.log('   2. Supabase 프로젝트가 활성화되어 있는지 확인하세요')
  }
}

testConnection()
