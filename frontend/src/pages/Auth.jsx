import { supabase } from "../services/supabase";

const login = async () => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  });

  if (error) {
    console.log(error.message);
    alert(error.message);
  } else {
    navigate("/");
  }
};