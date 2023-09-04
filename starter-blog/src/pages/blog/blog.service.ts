import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { type } from 'os'
import { Post } from 'types/blog.type'

/*
  Nếu bên slice chúng ta dùng createSlice để tạo slice thì bên RTK query dùng createApi
   + với createApi chúng ta gọi là slice api
   + nơi khai báo các baseUrl và các endpoits
*/

/*
  baseQuery: dùng cho mỗi endpoint để fetch api
  fetchBaseQuery là 1 function nhỏ được xây dựng trên fetch API
    + không hoàn toàn thay thế được axios nhưng sẽ giải quyết được hầu hết bài toán cơ bản
    + có thể dùng axios thay thế cũng được
*/

/*
  enPoints: là tập hợp những method giúp GET, POST, PUT, DELETE, ...
  khi khai báo enpoints nó sẽ sinh ra các HOOK TƯƠNG ỨNG để dùng trong component
    + có 2 kiểu là QUERY và MUTATION
      - query: thường dùng cho get
      - mutation: thường dùng cho các trường hợp update data như POST, PUT, DELETE
*/

// khi providesTags và match với bất kỳ invalidatesTags nào thì api có providesTags match sẽ được gọi lại

interface TagsType {
  type: 'Posts'
  id: string
}

export const blogApi = createApi({
  reducerPath: 'blogApi', // tên field trong Redux state
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/' }),
  tagTypes: ['Posts'], // dùng để quy định xem lúc nào cần gọi lại API, invalidate cache,...
  endpoints: (build) => ({
    // Generic tyoe theo thứ tự là kiểu response trả về và argument (để void nếu không truyền gì)
    getPosts: build.query<Post[], void>({
      query: () => 'posts', // http://localhost:4000/posts (method không có argument)

      /* providesTags có thể là 1 array hoặc callback return array
       * Nếu có bất kỳ 1 invalidatesTag nào match với providesTags này
       * thì sẽ làm cho getPosts api này chạy lại và cập nhật lại các bài post
       * cũng như các tags phía dưới
       */
      providesTags(result): TagsType[] {
        // là kết quả khi get post thành công
        /* callback này sẽ chạy mỗi khi getPosts api chạy
         * Mong muốn là sẽ return về một mảng kiểu
         * interface Tags: { type: "Posts"; id: string}[] // Posts trùng với tagTypes
         */
        if (result) {
          const final = [
            ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
            { type: 'Posts' as const, id: 'LIST' }
          ]
          console.log('final :>> ', final)
          return final
        }

        const final = [{ type: 'Posts' as const, id: 'LIST' }]
        console.log('final :>> ', final)
        return final
      }
    }),
    /*
     * Dùng mutation cho POST, PUT, DELETE
     */

    /* Post: là kiểu trả về (response)
     * Omit<Post, 'id'> : Kiểu của payload (request)
     */
    addPost: build.mutation<Post, Omit<Post, 'id'>>({
      query(body) {
        // payload
        return {
          url: 'posts', // http://localhost:4000/posts
          method: 'POST',
          body // payload
        }
      },
      /* invalidatesTags cung cấp các tag để báo hiệu cho những method nào có providesTags
       * match với nó sẽ bị gọi lại
       * Trong trường hợp này getPosts sẽ chạy lại
       */
      invalidatesTags: (result, error, body): TagsType[] => [{ type: 'Posts', id: 'LIST' }]
    })
  })
})

export const { useGetPostsQuery, useAddPostMutation } = blogApi
// hook useGetPostsQuery, useAddPostMutation sẽ tự động được sinh ra
