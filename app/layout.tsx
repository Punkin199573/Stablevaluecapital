import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import ChatwootWidget from "@/components/chatwoot-widget"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Stable Value Capital - Strategic Investment & Capital Management",
  description:
    "Premium wealth management and capital allocation solutions for discerning investors and institutions. Expert portfolio management, strategic investments, and comprehensive financial advisory services.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // WhatsApp Widget
              document.addEventListener('DOMContentLoaded', function() {
                // Create WhatsApp toggle button
                const whatsappToggle = document.createElement('div');
                whatsappToggle.id = 'whatsapp-toggle';
                whatsappToggle.innerHTML = \`
                  <div style="
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    z-index: 99999;
                    cursor: pointer;
                    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                    border-radius: 50%;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.5), 0 0 0 0 rgba(37, 211, 102, 0.7);
                    transition: all 0.3s ease;
                    animation: pulse-whatsapp 3s infinite;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                  " onmouseover="this.style.transform='scale(1.15)'; this.style.boxShadow='0 12px 40px rgba(37, 211, 102, 0.7), 0 0 0 10px rgba(37, 211, 102, 0.1)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 32px rgba(37, 211, 102, 0.5), 0 0 0 0 rgba(37, 211, 102, 0.7)'">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div id="whatsapp-options" style="
                    position: fixed;
                    bottom: 190px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1);
                    padding: 24px;
                    min-width: 320px;
                    display: none;
                    transform: translateY(20px) scale(0.9);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid rgba(37, 211, 102, 0.1);
                    z-index: 99998;
                  ">
                    <div style="margin-bottom: 20px; font-weight: 800; color: #1a1a1a; font-size: 18px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Choose WhatsApp Support
                    </div>
                    <a href="https://wa.me/447700144320" target="_blank" style="
                      display: flex;
                      align-items: center;
                      padding: 20px;
                      border-radius: 16px;
                      text-decoration: none;
                      color: #1a1a1a;
                      margin-bottom: 16px;
                      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                      border: 2px solid rgba(37, 211, 102, 0.1);
                      background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%);
                      position: relative;
                      overflow: hidden;
                    " onmouseover="this.style.backgroundColor='#25D366'; this.style.color='white'; this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 12px 32px rgba(37, 211, 102, 0.4)'; this.style.borderColor='#25D366'" onmouseout="this.style.backgroundColor=''; this.style.color='#1a1a1a'; this.style.transform='translateY(0) scale(1)'; this.style.boxShadow=''; this.style.borderColor='rgba(37, 211, 102, 0.1)'">
                      <div style="
                        width: 48px;
                        height: 32px;
                        background: linear-gradient(to bottom, #012169 0%, #012169 33%, white 33%, white 66%, #C8102E 66%);
                        border-radius: 6px;
                        margin-right: 20px;
                        flex-shrink: 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        position: relative;
                      ">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 6px; background: linear-gradient(to bottom, #012169 0%, #012169 33%, white 33%, white 66%, #C8102E 66%);"></div>
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 50%; background: #012169;"></div>
                        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 50%; background: #C8102E;"></div>
                        <div style="position: absolute; top: 0; left: 0; width: 40%; height: 50%; background: #012169;"></div>
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: white; transform: rotate(26.57deg); transform-origin: 0 0;"></div>
                        <div style="position: absolute; top: 0; right: 0; left: 0; height: 2px; background: white; transform: rotate(-26.57deg); transform-origin: 100% 0;"></div>
                        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: white; transform: translateY(-1px);"></div>
                        <div style="position: absolute; top: 0; left: 50%; bottom: 0; width: 2px; background: white; transform: translateX(-1px);"></div>
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: #C8102E; transform: rotate(26.57deg); transform-origin: 0 0;"></div>
                        <div style="position: absolute; top: 0; right: 0; left: 0; height: 1px; background: #C8102E; transform: rotate(-26.57deg); transform-origin: 100% 0;"></div>
                        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 4px; background: #C8102E; transform: translateY(-2px);"></div>
                        <div style="position: absolute; top: 0; left: 50%; bottom: 0; width: 4px; background: #C8102E; transform: translateX(-2px);"></div>
                      </div>
                      <div>
                        <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                          🇬🇧 UK Support
                        </div>
                        <div style="font-size: 14px; color: #666; font-weight: 600;">+44 7700 144320</div>
                      </div>
                    </a>
                    <a href="https://wa.me/19796188876" target="_blank" style="
                      display: flex;
                      align-items: center;
                      padding: 20px;
                      border-radius: 16px;
                      text-decoration: none;
                      color: #1a1a1a;
                      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                      border: 2px solid rgba(37, 211, 102, 0.1);
                      background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%);
                      position: relative;
                      overflow: hidden;
                    " onmouseover="this.style.backgroundColor='#25D366'; this.style.color='white'; this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 12px 32px rgba(37, 211, 102, 0.4)'; this.style.borderColor='#25D366'" onmouseout="this.style.backgroundColor=''; this.style.color='#1a1a1a'; this.style.transform='translateY(0) scale(1)'; this.style.boxShadow=''; this.style.borderColor='rgba(37, 211, 102, 0.1)'">
                      <div style="
                        width: 48px;
                        height: 32px;
                        background: linear-gradient(to right, #B22234 0%, #B22234 7.69%, white 7.69%, white 15.38%, #B22234 15.38%, #B22234 23.08%, white 23.08%, white 30.77%, #B22234 30.77%, #B22234 38.46%, white 38.46%, white 46.15%, #B22234 46.15%, #B22234 53.85%, white 53.85%, white 61.54%, #B22234 61.54%, #B22234 69.23%, white 69.23%, white 76.92%, #B22234 76.92%, #B22234 84.62%, white 84.62%, white 92.31%, #B22234 92.31%);
                        position: relative;
                        border-radius: 6px;
                        margin-right: 20px;
                        flex-shrink: 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                      ">
                        <div style="position: absolute; top: 0; left: 0; width: 40%; height: 53.85%; background: #3C3B6E; border-radius: 6px 0 0 0;"></div>
                        <div style="position: absolute; top: 2px; left: 2px; right: 2px; bottom: 2px; border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);"></div>
                      </div>
                      <div>
                        <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                          🇺🇸 US Support
                        </div>
                        <div style="font-size: 14px; color: #666; font-weight: 600;">+1 979 618 8876</div>
                      </div>
                    </a>
                  </div>
                \`;
                
                document.body.appendChild(whatsappToggle);
                
                const toggleBtn = whatsappToggle.querySelector('div');
                const optionsPanel = document.getElementById('whatsapp-options');
                let isOpen = false;
                
                toggleBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  isOpen = !isOpen;
                  if (isOpen) {
                    optionsPanel.style.display = 'block';
                    setTimeout(() => {
                      optionsPanel.style.transform = 'translateY(0) scale(1)';
                      optionsPanel.style.opacity = '1';
                    }, 10);
                  } else {
                    optionsPanel.style.transform = 'translateY(20px) scale(0.9)';
                    optionsPanel.style.opacity = '0';
                    setTimeout(() => {
                      optionsPanel.style.display = 'none';
                    }, 400);
                  }
                });
                
                // Close when clicking outside
                document.addEventListener('click', function(e) {
                  if (!whatsappToggle.contains(e.target) && isOpen) {
                    isOpen = false;
                    optionsPanel.style.transform = 'translateY(20px) scale(0.9)';
                    optionsPanel.style.opacity = '0';
                    setTimeout(() => {
                      optionsPanel.style.display = 'none';
                    }, 400);
                  }
                });
              });
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Enhanced pulse animation for WhatsApp button with better visibility */
              @keyframes pulse-whatsapp {
                0% {
                  box-shadow: 0 8px 32px rgba(37, 211, 102, 0.5), 0 0 0 0 rgba(37, 211, 102, 0.7);
                }
                50% {
                  box-shadow: 0 8px 32px rgba(37, 211, 102, 0.5), 0 0 0 15px rgba(37, 211, 102, 0.1);
                }
                100% {
                  box-shadow: 0 8px 32px rgba(37, 211, 102, 0.5), 0 0 0 0 rgba(37, 211, 102, 0.7);
                }
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans ${montserrat.variable} ${openSans.variable} antialiased`}>
        <ChatwootWidget />
        {children}
      </body>
    </html>
  )
}
