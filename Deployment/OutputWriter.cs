using System.IO;

namespace Deployment
{
    public class OutputWriter
    {
        /// <summary>
        /// WriteLine delegate
        /// </summary>
        /// <param name="text"></param>
        public delegate void WriteLineAction(string text);
        public event WriteLineAction WriteLineEvent;

        /// <summary>
        /// Write delegate
        /// </summary>
        /// <param name="text"></param>
        public delegate void WriteAction(string text);
        public event WriteAction WriteEvent;

        /// <summary>
        /// Keeps track of everything writen to the other outputs to send final message
        /// </summary>
        public static StringWriter OutputStringWriter = new StringWriter();

        public OutputWriter()
        {
            this.WriteLineEvent += OutputStringWriter.WriteLine;
            this.WriteEvent += OutputStringWriter.Write;
        }

        public void WriteLine(string text)
        {
            if (WriteLineEvent != null)
            {
                WriteLineEvent(text);
            }
        }

        public void Write(string text)
        {
            if (WriteEvent != null)
            {
                WriteEvent(text);
            }
        }
    }
}
