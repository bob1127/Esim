// pages/cart.tsx
import { useCart } from "../components/context/CartContext";
import Layout from "./Layout";
import Image from "next/image";
import Link from "next/link";
import SwiperCard from "../components/SwiperCarousel/SwiperCardTravel.jsx";
const CartPage = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  return (
    <Layout>
      <div className="pt-[280px] w-[90%]  mx-auto px-[50px] flex flex-col justify-center items-center  py-12">
        <div className="cart-title flex justify-between w-full mx-auto">
          <h1 className="text-3xl font-bold mb-6">您的購物車</h1>
          <Link href="">繼續選購商品</Link>
        </div>
        <div className="flex w-full">
          <div className="w-[10%]">
            <span className="text-[.9rem] text-gray-700">商品</span>
          </div>
          <div className="w-[50%]"></div>
          <div className="w-[20%]">
            <span className="text-[.9rem] text-gray-700">數量</span>
          </div>
          <div className="w-[20%]">
            <span className="text-[.9rem] text-gray-700">小計</span>
          </div>
        </div>
        {cartItems.length === 0 ? (
          <p>您的購物車是空的</p>
        ) : (
          <div className="space-y-6 pt-2 pb-[100px] w-full">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex pb-8 pt-3  w-full border-b-1 border-gray-300 "
              >
                <div className="w-[10%] ">
                  <Image
                    src={item.image}
                    width={100}
                    height={100}
                    alt={item.name}
                    className="rounded max-w-[100px] h-auto"
                  />
                </div>
                <div className="w-[50%] flex flex-col justify-center  pl-8 ">
                  <h2 className="font-bold text-[1.1rem] text-left">
                    {item.name}
                  </h2>
                  <div className="flex">
                    {" "}
                    <p className="text-[.8rem] mr-2 text-gray-600">
                      {item.color}
                    </p>
                    <p className="text-[.8rem] text-gray-600"> {item.size}</p>
                  </div>
                </div>
                <div className="w-[20%] ">
                  <div className="flex w-full justify-start items-center h-full">
                    <div className="flex mr-3 justify-center py-1 border rounded-full w-[110px] items-center gap-3 mt-2">
                      <button
                        className="text-[1.2rem]"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.color,
                            item.size,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span className="text-[1.2rem]">{item.quantity}</span>
                      <button
                        className="text-[1.2rem]"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.color,
                            item.size,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-red-500 mt-2 "
                      onClick={() =>
                        removeFromCart(item.id, item.color, item.size)
                      }
                    >
                      移除
                    </button>
                  </div>
                </div>
                <div className="w-[20%] flex items-center ">
                  {" "}
                  <p>單價: ${item.price}</p>
                </div>
              </div>
            ))}
            <div className="text-right text-xl font-bold">
              訂單總金額: ${totalPrice}
            </div>
            {cartItems.length > 0 && (
              <div className="flex justify-end mt-8">
                <Link
                  href="/checkout"
                  className="bg-[#B4746B] text-white px-6 py-3 rounded-full text-lg hover:bg-[#9c5e55] transition"
                >
                  繼續結帳
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <SwiperCard />
      </div>
    </Layout>
  );
};

export default CartPage;
