const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export type SendResetEmailParams = {
  to: string;
  resetToken: string;
};

export const sendPasswordResetEmail = async (
  params: SendResetEmailParams,
): Promise<{ success: boolean; error?: string }> => {
  const resetUrl = `${APP_URL}/reset-password?token=${params.resetToken}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>비밀번호 재설정 요청</h2>
      <p>안녕하세요,</p>
      <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          비밀번호 재설정
        </a>
      </div>
      <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 14px; margin-top: 30px;">
        이 링크는 1시간 동안 유효합니다.<br/>
        비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
      </p>
    </div>
  `;

  const emailText = `
비밀번호 재설정 요청

안녕하세요,

비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정하세요.

${resetUrl}

이 링크는 1시간 동안 유효합니다.
비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
  `;

  // Resend API 사용 (환경변수로 설정)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    // 개발 환경: 콘솔에 로그만 출력
    console.log("[DEV] Password Reset Email:");
    console.log("To:", params.to);
    console.log("Reset URL:", resetUrl);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: params.to,
        subject: "비밀번호 재설정 요청",
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "이메일 전송 실패",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "이메일 전송 중 오류 발생",
    };
  }
};
