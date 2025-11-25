"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
// import { useForm } from "react-hook-form";
import { useMyAuthHook } from "@/context/AppUtils";

import { removeProduct, fetchProductsByUser } from "@/lib/services/productService";


interface Product {
  id?: number;
  title: string;
  content: string;
  cost: number;
  banner_image?: string | File | null;
}
interface FormType {
  title: string;
  content: string;
  cost: number;
  bannerImage?: File | null;
}

export default function DashboardForm() {
  const router = useRouter();
  const supabase = createClient();
  const { isLoading, isLoggedIn, user } = useMyAuthHook();
 
  
  const [form, setForm] = useState<FormType>({
    title: "",
    content: "",
    cost: 0,
    bannerImage: null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchProducts() {
    // Fetch products from Supabase
    const { data, error } = await supabase.from("product").select("*").eq("user_id", user?.id);
    if (error) {
      toast.error("Error fetching products");
    } 
    if (data) {
      setProducts(data as Product[]);
    } 
  }

  async function uploadImageToSupabase(file: File): Promise<string | null> {
    const fileName = `${Date.now()}.${file.name.split(".").pop()}`;
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, file);

    if (error) {
      toast.error("Error uploading image");
      return null
    };
    
    return supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl;  
  }
  
  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Save on the table only if the user is logged in and an image uploaded in the Storage
    if (isLoggedIn && form.bannerImage) {
      const storagedFileName = await uploadImageToSupabase(form.bannerImage!);
    
      const { error } = await supabase.from("product").insert([{
        user_id: user?.id,
        title: form.title,
        content: form.content,
        cost: form.cost,
        banner_image: storagedFileName
      }]);
      
      if (error) {
        toast.error("Error adding product - The image is already uploaded");
      } else {
        toast.success("Product added successfully");
        fetchProducts();
        console.log("Products after addition:", products);
      }

      // Reset form after upload
      setForm({
        ...form, 
        title: "", content: "", cost: 0, bannerImage: p.banner_image
      });
      setPreviewImage(null);
    }
  }

  async function fetchProducts(user.id) {
    const { data, error } = await fetchProductsByUser(user.id);
    if (error) {
      toast.error("Error fetching products");
    } 
    if (data) {
      setProducts(data as Product[]);
    }
  }

  async function handleDelete(id?: number) {
    const { error } = await removeProduct(id!);
    if (error) {
      toast.error("Error deleting product");
    } else {
      toast.success("Product deleted successfully");
      fetchProducts(user.id);
    }
  } 
  // function handleEdit(p: Product) {
  //   console.log("Edit product:", p);
  //   setForm({
  //     ...form, 
  //     title: p.title, content: p.content, cost: p.cost, bannerImage: null
  //   });
  //   setPreviewImage(p.banner_image);
  // }

  useEffect(() => {
    fetchProducts();
  }, []);
  
  return (
    <>  
      <div className="container mt-5">
        <div className="row">

          {/* <!-- Left Side - Product Form --> */}
          <div className="col-md-5">
            <h3>Add Product</h3>
            <form onSubmit={ handleFormSubmit }>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" required 
                  value={ form?.title } onChange={(e) => setForm({
                    ...form, 
                    title: e.target.value
                  })}/>
                <small className="text-danger"></small>
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea className="form-control" 
                  value={ form.content} onChange={(e) => setForm({
                    ...form, 
                    content: e.target.value
                  })} >
                </textarea>
                <small className="text-danger"></small>
              </div>
              <div className="mb-3">
                <label className="form-label">Cost</label>
                <input type="number" className="form-control" required 
                  value={ form.cost } onChange={(e)=> setForm({
                    ...form, 
                    cost: parseFloat(e.target.value)
                  }) } />
                <small className="text-danger"></small>
              </div>
              <div className="mb-3">
                <label className="form-label">Banner Image</label>
                <div className="mb-2">
                  {
                    previewImage ? (<Image src={previewImage} alt="Preview" id="bannerPreview" width="100" height="100" />) 
                    : ""
                  }
                </div>
                <input type="file" className="form-control" 
                  onChange={(event)=>  {
                    const file =event.target.files?.[0];
                    if (!file) return;  
                    setForm({...form,bannerImage: file});
                    setPreviewImage(URL.createObjectURL(file));
                  }} />
                <small className="text-danger"></small>
              </div>
              <button className="btn btn-success w-100">Add Product</button>
            </form>
          </div>
      
          {/* <!-- Right Side - Product Table --> */}
          <div className="col-md-7">
            <h3>Product List</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Cost</th>
                  <th>Banner Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  products ? 
                    products.map( (p) => (
                    <tr key={p.title}>
                      <td> { p.title } </td>
                      <td> { p.content } </td>
                      <td> { p.cost}</td>
                      <td>
                        {p.banner_image ? <Image src={p.banner_image} alt="Sample Product" width="50" height={50}/> : ("---")}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(p.id)}  style={ {
                          marginLeft: "10px" } } >Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center">No products found.</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  ); 
}