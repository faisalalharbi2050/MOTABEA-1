# API Documentation - الاجتماعات التخصصية
## Department Meetings API Reference

---

## Base URL
```
http://localhost:5001/api/meetings
```

---

## Authentication
حالياً لا يوجد authentication، سيتم إضافته في الإصدارات المستقبلية.

---

## Endpoints

### 1. GET `/api/meetings`
**الوصف**: جلب جميع جلسات الاجتماعات التخصصية مع المشاركين

#### Request
```http
GET /api/meetings HTTP/1.1
Host: localhost:5001
```

#### Response
```json
{
  "success": true,
  "meetings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "اجتماع اللغة العربية - المجموعة الأولى",
      "day_index": 0,
      "period_index": 2,
      "allow_global_clash": false,
      "participants": [1, 3, 5, 7],
      "created_at": "2025-11-21T10:30:00.000Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "اجتماع الرياضيات",
      "day_index": 1,
      "period_index": 4,
      "allow_global_clash": true,
      "participants": [2, 4],
      "created_at": "2025-11-21T11:00:00.000Z"
    }
  ]
}
```

#### Status Codes
- `200 OK` - نجح
- `500 Internal Server Error` - خطأ في الخادم

---

### 2. POST `/api/meetings`
**الوصف**: إنشاء جلسة اجتماع تخصصية جديدة

#### Request
```http
POST /api/meetings HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "name": "اجتماع العلوم الأسبوعي",
  "day_index": 2,
  "period_index": 3,
  "allow_global_clash": false,
  "teacher_ids": [2, 4, 6]
}
```

#### Request Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ Yes | اسم الاجتماع |
| `day_index` | number | ✅ Yes | رقم اليوم (0=الأحد, 4=الخميس) |
| `period_index` | number | ✅ Yes | رقم الحصة (0-6) |
| `allow_global_clash` | boolean | ❌ No | السماح بالاستثناء (افتراضي: false) |
| `teacher_ids` | number[] | ❌ No | قائمة معرفات المعلمين |

#### Success Response
```json
{
  "success": true,
  "message": "تم إنشاء الاجتماع بنجاح",
  "meeting": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "name": "اجتماع العلوم الأسبوعي",
    "day_index": 2,
    "period_index": 3,
    "allow_global_clash": false,
    "participants": [2, 4, 6],
    "created_at": "2025-11-21T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - بيانات ناقصة
```json
{
  "success": false,
  "error": "البيانات المطلوبة ناقصة"
}
```

**400 Bad Request** - معلم في اجتماعين متعارضين
```json
{
  "success": false,
  "error": "بعض المعلمين موجودون بالفعل في اجتماع آخر في نفس التوقيت",
  "conflictingTeachers": [2, 4]
}
```

**409 Conflict** - تعارض مع تخصص آخر
```json
{
  "success": false,
  "error": "يوجد اجتماع لتخصص آخر في هذه الحصة",
  "conflictingMeetings": ["اجتماع الرياضيات"],
  "requireException": true
}
```

#### Status Codes
- `200 OK` - نجح
- `400 Bad Request` - بيانات غير صحيحة
- `409 Conflict` - تعارض يتطلب استثناء
- `500 Internal Server Error` - خطأ في الخادم

---

### 3. PUT `/api/meetings/:id`
**الوصف**: تحديث جلسة اجتماع موجودة

#### Request
```http
PUT /api/meetings/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "name": "اجتماع اللغة العربية - المحدث",
  "day_index": 0,
  "period_index": 3,
  "allow_global_clash": false,
  "teacher_ids": [1, 3, 5]
}
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | معرف الاجتماع (UUID) |

#### Request Body Parameters
نفس parameters الـ POST، جميعها اختيارية (سيتم تحديث المحدد فقط)

#### Success Response
```json
{
  "success": true,
  "message": "تم تحديث الاجتماع بنجاح",
  "meeting": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "اجتماع اللغة العربية - المحدث",
    "day_index": 0,
    "period_index": 3,
    "allow_global_clash": false,
    "participants": [1, 3, 5],
    "created_at": "2025-11-21T10:30:00.000Z",
    "updated_at": "2025-11-21T13:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": "الاجتماع غير موجود"
}
```

**409 Conflict** - نفس POST

#### Status Codes
- `200 OK` - نجح
- `404 Not Found` - الاجتماع غير موجود
- `409 Conflict` - تعارض يتطلب استثناء
- `500 Internal Server Error` - خطأ في الخادم

---

### 4. DELETE `/api/meetings/:id`
**الوصف**: حذف جلسة اجتماع ومشاركيها

#### Request
```http
DELETE /api/meetings/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:5001
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | معرف الاجتماع (UUID) |

#### Success Response
```json
{
  "success": true,
  "message": "تم حذف الاجتماع بنجاح"
}
```

#### Error Response

**404 Not Found**
```json
{
  "success": false,
  "error": "الاجتماع غير موجود"
}
```

#### Status Codes
- `200 OK` - نجح
- `404 Not Found` - الاجتماع غير موجود
- `500 Internal Server Error` - خطأ في الخادم

---

### 5. GET `/api/meetings/check-availability`
**الوصف**: التحقق من توفر حصة معينة للاجتماع

#### Request
```http
GET /api/meetings/check-availability?day_index=0&period_index=2 HTTP/1.1
Host: localhost:5001
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `day_index` | number | ✅ Yes | رقم اليوم (0-4) |
| `period_index` | number | ✅ Yes | رقم الحصة (0-6) |
| `exclude_id` | string | ❌ No | استبعاد اجتماع معين من الفحص |

#### Success Response - متاح
```json
{
  "success": true,
  "available": true,
  "conflictingMeetings": []
}
```

#### Success Response - غير متاح
```json
{
  "success": true,
  "available": false,
  "conflictingMeetings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "اجتماع اللغة العربية",
      "allow_global_clash": false
    }
  ]
}
```

#### Error Response

**400 Bad Request**
```json
{
  "success": false,
  "error": "يجب تحديد اليوم والحصة"
}
```

#### Status Codes
- `200 OK` - نجح
- `400 Bad Request` - parameters ناقصة
- `500 Internal Server Error` - خطأ في الخادم

---

## Data Models

### MeetingSession
```typescript
interface MeetingSession {
  id: string;              // UUID
  name: string;            // اسم الاجتماع
  day_index: number;       // 0-4 (الأحد-الخميس)
  period_index: number;    // 0-6 (الحصة الأولى-السابعة)
  allow_global_clash: boolean; // السماح بالاستثناء
  created_at: string;      // ISO 8601
  updated_at?: string;     // ISO 8601 (optional)
}
```

### MeetingParticipant
```typescript
interface MeetingParticipant {
  id: string;              // UUID
  meeting_id: string;      // UUID - foreign key
  teacher_id: number;      // معرف المعلم
  created_at: string;      // ISO 8601
}
```

---

## Validation Rules

### اسم الاجتماع (name)
- ✅ Required
- ✅ String
- ✅ لا يمكن أن يكون فارغاً

### رقم اليوم (day_index)
- ✅ Required
- ✅ Number
- ✅ يجب أن يكون بين 0-4
- 0 = الأحد
- 1 = الاثنين
- 2 = الثلاثاء
- 3 = الأربعاء
- 4 = الخميس

### رقم الحصة (period_index)
- ✅ Required
- ✅ Number
- ✅ يجب أن يكون بين 0-6
- 0 = الحصة الأولى
- 6 = الحصة السابعة

### معرفات المعلمين (teacher_ids)
- ❌ Optional
- ✅ Array of Numbers
- ✅ يجب أن تكون أرقام صحيحة موجبة

### السماح بالاستثناء (allow_global_clash)
- ❌ Optional
- ✅ Boolean
- ✅ Default: false

---

## Business Logic

### قواعد التعارض

#### قاعدة 1: معلم في اجتماعين
❌ **ممنوع**: لا يمكن لمعلم واحد أن يكون في اجتماعين مختلفين في نفس التوقيت

**التحقق**:
```javascript
const conflictingTeachers = [];
existingMeetings.forEach(meeting => {
  const duplicates = teacher_ids.filter(id => 
    meeting.participants.includes(id)
  );
  if (duplicates.length > 0) {
    conflictingTeachers.push(...duplicates);
  }
});
```

#### قاعدة 2: تخصصات مختلفة في نفس الحصة
⚠️ **تحذير**: يُفضل عدم وضع تخصصات مختلفة في نفس الحصة

**التحقق**:
```javascript
if (!allow_global_clash) {
  const existingMeetings = meetings.filter(
    m => m.day_index === day_index && 
         m.period_index === period_index && 
         !m.allow_global_clash
  );
  
  if (existingMeetings.length > 0) {
    return { requireException: true };
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "رسالة الخطأ بالعربية",
  "details": "تفاصيل إضافية (اختياري)"
}
```

### Console Logging
جميع العمليات يتم تسجيلها في console:

```javascript
console.log('✅ تم إنشاء جلسة اجتماع جديدة: اجتماع اللغة العربية');
console.log('✅ تم تحديث الاجتماع: 550e8400-...');
console.log('✅ تم حذف الاجتماع: اجتماع الرياضيات');
console.error('❌ خطأ في إنشاء الاجتماع:', error);
```

---

## Examples

### مثال 1: إنشاء اجتماع بسيط

**Request**:
```bash
curl -X POST http://localhost:5001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "اجتماع اللغة العربية",
    "day_index": 0,
    "period_index": 2,
    "teacher_ids": [1, 3, 5]
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "تم إنشاء الاجتماع بنجاح",
  "meeting": { ... }
}
```

---

### مثال 2: تحديث اجتماع

**Request**:
```bash
curl -X PUT http://localhost:5001/api/meetings/550e8400-... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "اجتماع اللغة العربية - محدث",
    "period_index": 3
  }'
```

---

### مثال 3: حذف اجتماع

**Request**:
```bash
curl -X DELETE http://localhost:5001/api/meetings/550e8400-...
```

---

### مثال 4: التحقق من التوفر

**Request**:
```bash
curl "http://localhost:5001/api/meetings/check-availability?day_index=0&period_index=2"
```

**Response**:
```json
{
  "success": true,
  "available": false,
  "conflictingMeetings": [...]
}
```

---

## Rate Limiting

حالياً لا يوجد rate limiting، سيتم إضافته في الإصدارات المستقبلية.

**مخطط**:
- 100 requests/minute per IP
- 1000 requests/hour per IP

---

## Versioning

**Current Version**: v1.0  
**API Version**: v1

**Future**: سيتم استخدام `/api/v2/meetings` للإصدارات المستقبلية

---

## CORS

CORS مفعّل حالياً لجميع الـ origins:

```javascript
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

**Production**: سيتم تقييد origins للأمان

---

## Testing

### مثال باستخدام Postman

1. **Create Collection**: "Department Meetings API"
2. **Add Requests**:
   - GET All Meetings
   - POST Create Meeting
   - PUT Update Meeting
   - DELETE Delete Meeting
   - GET Check Availability

3. **Environment Variables**:
   ```
   BASE_URL: http://localhost:5001
   MEETING_ID: 550e8400-e29b-41d4-a716-446655440000
   ```

---

## Migration Notes

### من mockDatabase إلى قاعدة بيانات حقيقية

**SQL Schema** (للمستقبل):

```sql
CREATE TABLE meeting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 4),
  period_index INTEGER NOT NULL CHECK (period_index BETWEEN 0 AND 6),
  allow_global_clash BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meeting_slot ON meeting_sessions(day_index, period_index);
CREATE INDEX idx_participant_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_participant_teacher ON meeting_participants(teacher_id);
```

---

## Support

للأسئلة أو المشاكل:
- راجع الدليل الشامل: `DEPARTMENT-MEETINGS-FEATURE-GUIDE.md`
- راجع CHANGELOG: `DEPARTMENT-MEETINGS-CHANGELOG.md`

---

**Last Updated**: 21 نوفمبر 2025  
**API Version**: 1.0.0  
**Status**: ✅ مستقر

---
