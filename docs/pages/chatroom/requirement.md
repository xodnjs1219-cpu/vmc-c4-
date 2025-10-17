# 채팅방 페이지 요구사항 명세

**페이지 경로:** `/room/[roomId]`
**작성일:** 2025-10-17
**버전:** 1.0

---

## 1. 개요

채팅방 페이지는 사용자가 실시간으로 메시지를 주고받을 수 있는 핵심 기능 페이지입니다. 사용자는 메시지를 전송하고, 다른 사용자의 메시지를 실시간으로 수신하며, 메시지에 대한 상호작용(좋아요, 답장, 삭제)을 수행할 수 있습니다.

## 2. 주요 기능

### 2.1 실시간 메시지 전송 및 수신 (유스케이스 005)

#### 행동
1. **메시지 입력**
   - 사용자가 채팅방 하단의 입력창에 텍스트 또는 이모티콘을 입력
   - 입력창은 최소 2줄, 최대 4줄까지 자동 확장
   - 1000자 제한, 900자 이상부터 글자 수 카운터 표시

2. **메시지 전송**
   - 전송 버튼 클릭 또는 Enter 키 입력
   - 공백만 있는 메시지는 전송 불가 (전송 버튼 비활성화)
   - Shift+Enter로 줄바꿈

3. **메시지 수신**
   - WebSocket을 통해 실시간으로 새 메시지 수신
   - 모든 사용자의 타임라인에 즉시 표시

#### 데이터 흐름
1. **클라이언트 → 백엔드**
   - 메시지 내용 검증 (공백 확인)
   - POST `/api/messages` 요청
   - 요청 데이터: `{ roomId, content, type: 'text' | 'emoji' | 'mixed' }`

2. **백엔드 → 데이터베이스**
   - 메시지 유효성 재검증 (내용, 길이, 인증, 채팅방 존재)
   - `messages` 테이블에 INSERT
   - 저장 데이터: `content, user_id, chat_room_id, message_type, created_at`

3. **백엔드 → 실시간 채널**
   - Supabase Realtime을 통해 해당 채팅방의 모든 연결된 사용자에게 브로드캐스트
   - 전송 데이터: 저장된 메시지 객체 (id, content, user_id, created_at 등)

4. **실시간 채널 → 클라이언트**
   - 모든 사용자가 새 메시지 수신
   - 타임라인에 메시지 추가 (작성자 닉네임, 내용, 시간 표시)

#### 상태 변화
- **전송 중**: 로딩 인디케이터 표시, 전송 버튼 비활성화
- **전송 성공**: 입력창 초기화, 타임라인에 메시지 추가, 체크 표시
- **전송 실패**: 에러 메시지 표시, 입력 내용 유지, 재전송 옵션 제공

### 2.2 메시지 상호작용

#### 2.2.1 좋아요 추가/취소

##### 행동
1. 사용자가 특정 메시지의 좋아요 버튼 클릭
2. 이미 좋아요를 누른 경우 취소, 아닌 경우 추가

##### 데이터 흐름
1. **클라이언트 → 백엔드**
   - POST `/api/messages/:messageId/like` (추가)
   - DELETE `/api/messages/:messageId/like` (취소)

2. **백엔드 → 데이터베이스**
   - `message_likes` 테이블 조회: 기존 좋아요 확인
   - 좋아요 추가: INSERT `(message_id, user_id, created_at)`
   - 좋아요 취소: DELETE WHERE `message_id = ? AND user_id = ?`

3. **백엔드 → 실시간 채널**
   - 좋아요 상태 변경 브로드캐스트
   - 전송 데이터: `{ messageId, likeCount, userId, action: 'add' | 'remove' }`

4. **실시간 채널 → 클라이언트**
   - 모든 사용자의 해당 메시지 좋아요 카운트 및 상태 업데이트

##### 상태 변화
- 좋아요 추가: 아이콘 활성화, 카운트 +1
- 좋아요 취소: 아이콘 비활성화, 카운트 -1

#### 2.2.2 답장 작성

##### 행동
1. 사용자가 특정 메시지의 답장 버튼 클릭
2. 입력창 상단에 원본 메시지 인용 영역 표시
3. 답장 내용 입력 후 전송

##### 데이터 흐름
1. **클라이언트 → 백엔드**
   - POST `/api/messages` 요청
   - 요청 데이터: `{ roomId, content, type, replyToMessageId }`

2. **백엔드 → 데이터베이스**
   - `messages` 테이블에 INSERT
   - 저장 데이터: 기본 필드 + `reply_to_message_id`

3. **백엔드 → 실시간 채널**
   - 답장 메시지 브로드캐스트 (원본 메시지 정보 포함)

4. **실시간 채널 → 클라이언트**
   - 모든 사용자 타임라인에 답장 메시지 표시
   - 원본 메시지 인용과 함께 렌더링

##### 상태 변화
- 답장 모드 활성화: 입력창 상단에 인용 영역 표시
- 답장 전송: 인용 영역 제거, 타임라인에 답장 추가

#### 2.2.3 메시지 삭제

##### 행동
1. 사용자가 자신이 작성한 메시지의 삭제 버튼 클릭
2. 삭제 확인 다이얼로그 표시
3. 확인 시 메시지 삭제

##### 데이터 흐름
1. **클라이언트 → 백엔드**
   - DELETE `/api/messages/:messageId` 요청

2. **백엔드**
   - 작성자 확인: `message.user_id === currentUser.id`
   - 권한 없으면 403 에러

3. **백엔드 → 데이터베이스**
   - `messages` 테이블 UPDATE (soft delete)
   - 업데이트 데이터: `is_deleted = true, deleted_at = now()`

4. **백엔드 → 실시간 채널**
   - 삭제 이벤트 브로드캐스트
   - 전송 데이터: `{ messageId, action: 'delete' }`

5. **실시간 채널 → 클라이언트**
   - 모든 사용자의 타임라인에서 해당 메시지 제거
   - 답글에서는 "삭제된 메시지입니다." 표시

##### 상태 변화
- 삭제 성공: 타임라인에서 메시지 제거
- 답글 내 인용: "삭제된 메시지입니다." 텍스트로 대체

### 2.3 메시지 목록 조회 및 페이지네이션

#### 행동
1. 채팅방 진입 시 최근 50개 메시지 로드
2. 스크롤을 위로 올리면 이전 메시지 추가 로드 (무한 스크롤)
3. 메시지는 시간순으로 정렬 (오래된 메시지 → 최신 메시지)

#### 데이터 흐름
1. **초기 로드**
   - GET `/api/rooms/:roomId/messages?limit=50` 요청
   - 응답: 메시지 배열 + 작성자 정보 + 좋아요 정보

2. **추가 로드**
   - GET `/api/rooms/:roomId/messages?before=:lastMessageId&limit=50`
   - 응답: 이전 메시지 배열

3. **데이터베이스 쿼리**
   ```sql
   SELECT m.*, u.nickname, COUNT(ml.id) as like_count
   FROM messages m
   INNER JOIN users u ON m.user_id = u.id
   LEFT JOIN message_likes ml ON m.id = ml.message_id
   WHERE m.chat_room_id = ? AND m.is_deleted = false
   GROUP BY m.id
   ORDER BY m.created_at DESC
   LIMIT 50
   ```

#### 상태 변화
- 로딩 중: 스켈레톤 UI 또는 로딩 스피너 표시
- 로드 완료: 메시지 목록 렌더링
- 더 이상 메시지 없음: "모든 메시지를 불러왔습니다" 표시

### 2.4 실시간 연결 관리

#### 행동
1. 채팅방 입장 시 Supabase Realtime 채널 구독
2. 채팅방 퇴장 시 구독 해제
3. 연결 끊김 시 자동 재연결 시도

#### 데이터 흐름
1. **채널 구독**
   ```typescript
   supabase.channel(`room:${roomId}`)
     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, handleMessageUpdate)
     .subscribe()
   ```

2. **연결 상태 모니터링**
   - Heartbeat/Ping-Pong으로 연결 상태 확인
   - 연결 끊김 감지 시 자동 재연결 (최대 3회 시도)

3. **재연결 시 메시지 동기화**
   - 마지막 수신 메시지 ID 이후의 메시지 조회
   - GET `/api/rooms/:roomId/messages?after=:lastMessageId`

#### 상태 변화
- 연결됨: 정상 상태 (인디케이터 없음)
- 연결 끊김: "연결 끊김" 경고 표시
- 재연결 중: "재연결 중..." 표시
- 재연결 실패: "연결 실패. 페이지를 새로고침해주세요." 표시

## 3. 데이터베이스 사용

### 3.1 관련 테이블

1. **messages**
   - 메시지 내용 저장
   - 컬럼: `id, chat_room_id, user_id, content, message_type, reply_to_message_id, is_deleted, deleted_at, created_at`

2. **message_likes**
   - 메시지 좋아요 저장
   - 컬럼: `id, message_id, user_id, created_at`
   - 복합 유니크: `(message_id, user_id)` - 중복 좋아요 방지

3. **users**
   - 작성자 정보 참조
   - 조인을 통해 닉네임 조회

4. **chat_rooms**
   - 채팅방 존재 여부 확인

### 3.2 주요 쿼리 패턴

1. **메시지 목록 조회 (작성자 + 좋아요 정보 포함)**
   ```sql
   SELECT
     m.id, m.content, m.message_type, m.created_at,
     u.nickname as author_nickname,
     COUNT(ml.id) as like_count,
     BOOL_OR(ml.user_id = :currentUserId) as is_liked_by_me,
     rm.id as reply_to_id,
     rm.content as reply_to_content,
     rm.is_deleted as reply_to_is_deleted,
     ru.nickname as reply_to_author_nickname
   FROM messages m
   INNER JOIN users u ON m.user_id = u.id
   LEFT JOIN message_likes ml ON m.id = ml.message_id
   LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
   LEFT JOIN users ru ON rm.user_id = ru.id
   WHERE m.chat_room_id = :roomId AND m.is_deleted = false
   GROUP BY m.id, u.id, rm.id, ru.id
   ORDER BY m.created_at DESC
   LIMIT :limit
   ```

2. **메시지 생성**
   ```sql
   INSERT INTO messages (chat_room_id, user_id, content, message_type, reply_to_message_id)
   VALUES (:roomId, :userId, :content, :type, :replyToId)
   RETURNING *
   ```

3. **좋아요 추가**
   ```sql
   INSERT INTO message_likes (message_id, user_id)
   VALUES (:messageId, :userId)
   ON CONFLICT (message_id, user_id) DO NOTHING
   ```

4. **좋아요 취소**
   ```sql
   DELETE FROM message_likes
   WHERE message_id = :messageId AND user_id = :userId
   ```

5. **메시지 삭제 (soft delete)**
   ```sql
   UPDATE messages
   SET is_deleted = true, deleted_at = now()
   WHERE id = :messageId AND user_id = :userId
   ```

## 4. 에러 케이스 처리

### 4.1 빈 메시지 전송 시도
- **검증**: 클라이언트에서 공백 확인, 전송 버튼 비활성화
- **피드백**: "메시지를 입력해주세요" 표시

### 4.2 최대 길이 초과
- **검증**: 클라이언트에서 1000자 제한, 백엔드 재검증
- **피드백**: "메시지는 최대 1000자까지 입력 가능합니다"

### 4.3 네트워크 오류
- **처리**: 전송 실패 피드백, 입력 내용 유지
- **액션**: 재전송 버튼 제공

### 4.4 인증 만료
- **처리**: 401 에러 응답
- **피드백**: "로그인이 만료되었습니다"
- **액션**: 로그인 페이지로 리다이렉트

### 4.5 채팅방 삭제됨
- **처리**: 404 에러 응답
- **피드백**: "채팅방을 찾을 수 없습니다"
- **액션**: 홈 페이지로 리다이렉트

### 4.6 실시간 연결 끊김
- **처리**: 자동 재연결 시도 (최대 3회)
- **피드백**: "연결 끊김" 경고 표시
- **액션**: 재연결 성공 시 누락된 메시지 동기화

### 4.7 삭제 권한 없음
- **검증**: 백엔드에서 작성자 확인
- **처리**: 403 에러 응답
- **피드백**: "메시지를 삭제할 권한이 없습니다"

## 5. 성능 최적화 요구사항

### 5.1 메시지 렌더링 최적화
- 가상 스크롤 적용 (react-window 또는 react-virtualized)
- 메시지 컴포넌트 메모이제이션 (React.memo)

### 5.2 네트워크 최적화
- 메시지 페이지네이션 (초기 50개, 스크롤 시 추가 로드)
- 이미지/이모티콘 레이지 로딩

### 5.3 상태 관리 최적화
- 클라이언트 상태 (UI, 입력)와 서버 상태 (메시지 목록) 분리
- React Query로 서버 상태 캐싱 및 동기화
- 낙관적 업데이트로 UX 개선

### 5.4 실시간 통신 최적화
- 메시지 배치 전송 (100ms 단위 그룹핑)
- 압축 전송 (gzip/brotli)

## 6. UI/UX 요구사항

### 6.1 메시지 입력창
- 채팅방 하단 고정 위치
- 최소 2줄, 최대 4줄 자동 확장 텍스트 영역
- 1000자 글자 수 카운터 (900자 이상부터 표시)
- Enter 키로 전송, Shift+Enter로 줄바꿈
- 전송 버튼: 메시지 있을 때만 활성화

### 6.2 메시지 타임라인
- 최신 메시지가 하단에 추가
- 새 메시지 수신 시 부드러운 스크롤 애니메이션
- 사용자가 스크롤 중일 때는 자동 스크롤 비활성화
- "새 메시지" 알림 버튼으로 최신 메시지로 이동

### 6.3 메시지 아이템
- 작성자 닉네임, 메시지 내용, 전송 시간 표시
- 자신의 메시지는 오른쪽 정렬, 다른 사람은 왼쪽 정렬
- 답장 메시지는 원본 인용 영역 포함
- 삭제된 원본 메시지는 "삭제된 메시지입니다." 표시

### 6.4 메시지 액션
- 호버 시 액션 버튼 표시 (좋아요, 답장, 삭제)
- 삭제 버튼은 자신의 메시지에만 표시
- 좋아요는 아이콘 + 카운트 표시

### 6.5 전송 상태 표시
- 전송 중: 로딩 인디케이터
- 전송 완료: 체크 표시
- 전송 실패: 경고 아이콘 + 재전송 버튼

### 6.6 연결 상태 표시
- 연결 끊김: "연결 끊김" 배너 표시
- 재연결 중: "재연결 중..." 배너 표시
- 재연결 실패: "연결 실패" 배너 + 새로고침 버튼

## 7. 비즈니스 규칙

### 7.1 메시지 영구 저장
- 모든 전송된 메시지는 데이터베이스에 영구 저장
- 삭제는 논리적 삭제 (is_deleted = true)

### 7.2 실시간 동기화
- 채팅방의 모든 사용자는 동일한 메시지 타임라인 공유
- 새 메시지는 즉시 모든 사용자에게 전달 (500ms 이하)

### 7.3 메시지 순서 보장
- 메시지는 타임스탬프 순서대로 정렬
- 동일 시간대 메시지는 ID 순서로 정렬

### 7.4 작성자 정보 연동
- 메시지의 닉네임은 항상 작성자의 현재 닉네임 참조
- 닉네임 변경 시 기존 메시지도 자동 업데이트

### 7.5 메시지 삭제 권한
- 삭제는 작성자 본인만 가능
- 삭제된 메시지는 타임라인에서 제거
- 답글에서는 "삭제된 메시지입니다." 표시

## 8. 관련 유스케이스

- **유스케이스 005**: 실시간 메시지 전송 (`/docs/usecases/005/spec.md`)
- **유저플로우 5**: 실시간 메시지 전송 (`/docs/userflow.md`)
- **유저플로우 6**: 메시지 상호작용 (좋아요, 답장, 삭제) (`/docs/userflow.md`)

## 9. 참고 문서

- PRD: `/docs/prd.md`
- 데이터베이스 스키마: `/docs/database.md`
- 유저플로우: `/docs/userflow.md`
