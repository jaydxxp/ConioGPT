import { useState } from "react"

export default function Sidebar()
{
    const [sidebaropen,setsidebaropen]=useState(false);
    const ToggleSidebar=()=>setsidebaropen(!sidebaropen)
    
    return <div>
        <div className="hover:bg-stone-900 p-3 rounded-4xl ">
                <button onClick={ToggleSidebar} className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    href="http://www.w3.org/1999/xlink"
                    fill="#C4C7C9"
                    version="1.1"
                    id="Capa_1"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24.75 24.75"
                  >
                    <g>
                      <path d="M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2   c-1.104,0-2,0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855,10.375,22.75,10.375z M22.75,18.875H2   c-1.104,0-2,0.896-2,2s0.896,2,2,2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z" />
                    </g>
                  </svg>
                  </button>
                  </div>
                  <div
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 text-white transform
        transition-transform duration-300 ease-in-out z-20
        ${sidebaropen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <span className="text-lg font-bold">Chat History</span>
          <button
            className="text-white text-xl font-bold"
            onClick={() => setsidebaropen(false)}
          >
            ✕
          </button>
        </div>
       
      </div>


      {sidebaropen && (
        <div
          className="fixed inset-0 bg-black/40 z-10"
          onClick={() => setsidebaropen(false)}
        />
      )}
    </div>
}